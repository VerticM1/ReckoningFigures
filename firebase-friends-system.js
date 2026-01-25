// Reckoning Figures - Firebase Friends System
// Real-time friends system using Firebase Firestore

class FirebaseFriendsSystem {
    constructor() {
        this.auth = window.firebaseAuth;
        this.db = window.firebaseDB;
        this.currentUser = null;
        this.unsubscribers = [];
    }

    // Wait for authentication
    async waitForAuth() {
        return new Promise((resolve) => {
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                resolve(user);
            });
        });
    }

    // Get current user ID
    getCurrentUserId() {
        return this.currentUser ? this.currentUser.uid : null;
    }

    // ===== USER MANAGEMENT =====

    async createOrUpdateUser(username, xp = 0, streak = 0) {
        const userId = this.getCurrentUserId();
        if (!userId) throw new Error('Not authenticated');

        const userRef = this.db.collection('users').doc(userId);
        
        await userRef.set({
            userId: userId,
            userName: username,
            xp: xp,
            streak: streak,
            email: this.currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return { success: true };
    }

    async getUserData(userId) {
        const userDoc = await this.db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            return userDoc.data();
        }
        return null;
    }

    async getCurrentUserData() {
        const userId = this.getCurrentUserId();
        if (!userId) return null;
        return this.getUserData(userId);
    }

    async setUsername(username) {
        username = username.trim();
        
        // Validation
        if (username.length < 3 || username.length > 20) {
            return { success: false, error: 'Username must be 3-20 characters' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { success: false, error: 'Username can only contain letters, numbers, and underscores' };
        }

        // Check if username is taken
        const existingUsers = await this.db.collection('users')
            .where('userName', '==', username)
            .get();
        
        const userId = this.getCurrentUserId();
        const isTaken = !existingUsers.empty && 
            existingUsers.docs.some(doc => doc.id !== userId);
        
        if (isTaken) {
            return { success: false, error: 'Username already taken' };
        }

        // Update username
        await this.createOrUpdateUser(username);
        
        return { success: true };
    }

    async syncProgressFromLocalStorage() {
        const progress = JSON.parse(localStorage.getItem('reckonProgress') || '{}');
        if (progress.userName) {
            await this.createOrUpdateUser(
                progress.userName,
                progress.xp || 0,
                progress.streak || 0
            );
        }
    }

    // ===== SEARCH =====

    async searchUsers(query) {
        if (!query || query.length < 2) return [];
        
        const userId = this.getCurrentUserId();
        if (!userId) return [];

        query = query.toLowerCase();

        // Get all users (in production, you'd want server-side search)
        const usersSnapshot = await this.db.collection('users').get();
        const users = [];

        usersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.userId !== userId && 
                data.userName.toLowerCase().includes(query)) {
                users.push({
                    userId: data.userId,
                    userName: data.userName,
                    xp: data.xp || 0,
                    streak: data.streak || 0
                });
            }
        });

        // Filter out existing friends
        const friends = await this.getFriends();
        const friendIds = friends.map(f => f.userId);
        
        return users
            .filter(u => !friendIds.includes(u.userId))
            .slice(0, 10);
    }

    // ===== FRIEND REQUESTS =====

    async sendFriendRequest(toUserId) {
        const fromUserId = this.getCurrentUserId();
        if (!fromUserId) throw new Error('Not authenticated');

        // Check if request already exists
        const existingRequest = await this.db.collection('friendRequests')
            .where('fromUserId', '==', fromUserId)
            .where('toUserId', '==', toUserId)
            .get();

        if (!existingRequest.empty) {
            return { success: false, error: 'Request already sent' };
        }

        // Check if already friends
        const areFriends = await this.checkIfFriends(fromUserId, toUserId);
        if (areFriends) {
            return { success: false, error: 'Already friends' };
        }

        // Create request
        await this.db.collection('friendRequests').add({
            fromUserId: fromUserId,
            toUserId: toUserId,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return { success: true };
    }

    async getIncomingRequests() {
        const userId = this.getCurrentUserId();
        if (!userId) return [];

        const snapshot = await this.db.collection('friendRequests')
            .where('toUserId', '==', userId)
            .where('status', '==', 'pending')
            .get();

        const requests = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const userData = await this.getUserData(data.fromUserId);
            if (userData) {
                requests.push({
                    requestId: doc.id,
                    userId: data.fromUserId,
                    userName: userData.userName,
                    xp: userData.xp || 0,
                    streak: userData.streak || 0
                });
            }
        }

        return requests;
    }

    async getOutgoingRequests() {
        const userId = this.getCurrentUserId();
        if (!userId) return [];

        const snapshot = await this.db.collection('friendRequests')
            .where('fromUserId', '==', userId)
            .where('status', '==', 'pending')
            .get();

        const requests = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const userData = await this.getUserData(data.toUserId);
            if (userData) {
                requests.push({
                    requestId: doc.id,
                    userId: data.toUserId,
                    userName: userData.userName,
                    xp: userData.xp || 0,
                    streak: userData.streak || 0
                });
            }
        }

        return requests;
    }

    async acceptFriendRequest(requestId) {
        const userId = this.getCurrentUserId();
        if (!userId) throw new Error('Not authenticated');

        // Get the request
        const requestDoc = await this.db.collection('friendRequests').doc(requestId).get();
        if (!requestDoc.exists) {
            return { success: false, error: 'Request not found' };
        }

        const requestData = requestDoc.data();
        
        // Verify this request is for current user
        if (requestData.toUserId !== userId) {
            return { success: false, error: 'Unauthorized' };
        }

        // Create friendship (using a deterministic ID)
        const user1 = requestData.fromUserId;
        const user2 = requestData.toUserId;
        const friendshipId = [user1, user2].sort().join('_');

        await this.db.collection('friendships').doc(friendshipId).set({
            user1: user1,
            user2: user2,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Delete the request
        await this.db.collection('friendRequests').doc(requestId).delete();

        return { success: true };
    }

    async declineFriendRequest(requestId) {
        const userId = this.getCurrentUserId();
        if (!userId) throw new Error('Not authenticated');

        // Get the request to verify ownership
        const requestDoc = await this.db.collection('friendRequests').doc(requestId).get();
        if (!requestDoc.exists) {
            return { success: false, error: 'Request not found' };
        }

        const requestData = requestDoc.data();
        if (requestData.toUserId !== userId) {
            return { success: false, error: 'Unauthorized' };
        }

        // Delete the request
        await this.db.collection('friendRequests').doc(requestId).delete();

        return { success: true };
    }

    // ===== FRIENDS MANAGEMENT =====

    async checkIfFriends(userId1, userId2) {
        const friendshipId = [userId1, userId2].sort().join('_');
        const doc = await this.db.collection('friendships').doc(friendshipId).get();
        return doc.exists;
    }

    async getFriends() {
        const userId = this.getCurrentUserId();
        if (!userId) return [];

        // Get all friendships where user is involved
        const snapshot1 = await this.db.collection('friendships')
            .where('user1', '==', userId)
            .get();

        const snapshot2 = await this.db.collection('friendships')
            .where('user2', '==', userId)
            .get();

        const friendIds = new Set();
        snapshot1.forEach(doc => friendIds.add(doc.data().user2));
        snapshot2.forEach(doc => friendIds.add(doc.data().user1));

        // Get user data for all friends
        const friends = [];
        for (const friendId of friendIds) {
            const userData = await this.getUserData(friendId);
            if (userData) {
                friends.push({
                    userId: userData.userId,
                    userName: userData.userName,
                    xp: userData.xp || 0,
                    streak: userData.streak || 0
                });
            }
        }

        // Sort by XP
        return friends.sort((a, b) => b.xp - a.xp);
    }

    async removeFriend(friendUserId) {
        const userId = this.getCurrentUserId();
        if (!userId) throw new Error('Not authenticated');

        const friendshipId = [userId, friendUserId].sort().join('_');
        await this.db.collection('friendships').doc(friendshipId).delete();

        return { success: true };
    }

    // ===== REAL-TIME LISTENERS =====

    listenToIncomingRequests(callback) {
        const userId = this.getCurrentUserId();
        if (!userId) return;

        const unsubscribe = this.db.collection('friendRequests')
            .where('toUserId', '==', userId)
            .where('status', '==', 'pending')
            .onSnapshot(async (snapshot) => {
                const requests = [];
                for (const doc of snapshot.docs) {
                    const data = doc.data();
                    const userData = await this.getUserData(data.fromUserId);
                    if (userData) {
                        requests.push({
                            requestId: doc.id,
                            userId: data.fromUserId,
                            userName: userData.userName,
                            xp: userData.xp || 0,
                            streak: userData.streak || 0
                        });
                    }
                }
                callback(requests);
            });

        this.unsubscribers.push(unsubscribe);
        return unsubscribe;
    }

    listenToFriends(callback) {
        const userId = this.getCurrentUserId();
        if (!userId) return;

        // Listen to friendships where user is user1
        const unsubscribe1 = this.db.collection('friendships')
            .where('user1', '==', userId)
            .onSnapshot(() => this.getFriends().then(callback));

        // Listen to friendships where user is user2
        const unsubscribe2 = this.db.collection('friendships')
            .where('user2', '==', userId)
            .onSnapshot(() => this.getFriends().then(callback));

        this.unsubscribers.push(unsubscribe1, unsubscribe2);
        
        return () => {
            unsubscribe1();
            unsubscribe2();
        };
    }

    // Clean up listeners
    unsubscribeAll() {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
    }

    // ===== STATS =====

    async getFriendCount() {
        const friends = await this.getFriends();
        return friends.length;
    }

    async getPendingRequestCount() {
        const requests = await this.getIncomingRequests();
        return requests.length;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.FirebaseFriendsSystem = FirebaseFriendsSystem;
}
