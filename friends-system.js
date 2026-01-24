// Reckoning Figures - Friends System
// localStorage-based friend management system

class FriendsSystem {
    constructor() {
        this.userId = this.getUserId();
        this.initializeUser();
    }

    // Get or create unique user ID
    getUserId() {
        let userId = localStorage.getItem('reckonUserId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('reckonUserId', userId);
        }
        return userId;
    }

    // Initialize user data
    initializeUser() {
        // Get user progress
        const progress = JSON.parse(localStorage.getItem('reckonProgress') || '{}');
        
        // Create user profile if doesn't exist
        if (!progress.userId) {
            progress.userId = this.userId;
            progress.userName = null; // Will be set by user
            localStorage.setItem('reckonProgress', JSON.stringify(progress));
        }

        // Initialize friends list
        if (!localStorage.getItem(`reckonFriends_${this.userId}`)) {
            localStorage.setItem(`reckonFriends_${this.userId}`, JSON.stringify([]));
        }

        // Initialize friend requests
        if (!localStorage.getItem(`reckonRequests_${this.userId}`)) {
            localStorage.setItem(`reckonRequests_${this.userId}`, JSON.stringify({
                incoming: [],
                outgoing: []
            }));
        }
    }

    // Username Management
    setUsername(username) {
        username = username.trim();
        
        // Validation
        if (username.length < 3 || username.length > 20) {
            return { success: false, error: 'Username must be 3-20 characters' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { success: false, error: 'Username can only contain letters, numbers, and underscores' };
        }

        // Check if username is taken
        const allUsers = this.getAllUsers();
        const existing = allUsers.find(u => u.userName === username && u.userId !== this.userId);
        if (existing) {
            return { success: false, error: 'Username already taken' };
        }

        // Update username
        const progress = JSON.parse(localStorage.getItem('reckonProgress') || '{}');
        progress.userName = username;
        localStorage.setItem('reckonProgress', JSON.stringify(progress));

        return { success: true };
    }

    getUsername() {
        const progress = JSON.parse(localStorage.getItem('reckonProgress') || '{}');
        return progress.userName;
    }

    // Get all users (simulated from localStorage)
    getAllUsers() {
        const users = [];
        
        // In a real app, this would query a backend
        // For demo, we'll create some fake users + the real user
        const progress = JSON.parse(localStorage.getItem('reckonProgress') || '{}');
        
        if (progress.userName) {
            users.push({
                userId: this.userId,
                userName: progress.userName,
                xp: progress.xp || 0,
                streak: progress.streak || 0
            });
        }

        // Add demo users if needed
        const demoUsers = this.getDemoUsers();
        users.push(...demoUsers);

        return users;
    }

    // Demo users for testing
    getDemoUsers() {
        return [
            { userId: 'demo_1', userName: 'MathWizard', xp: 1250, streak: 15 },
            { userId: 'demo_2', userName: 'AlgebraKing', xp: 890, streak: 8 },
            { userId: 'demo_3', userName: 'EquationMaster', xp: 730, streak: 12 },
            { userId: 'demo_4', userName: 'NumberNinja', xp: 620, streak: 5 },
            { userId: 'demo_5', userName: 'CalcQueen', xp: 540, streak: 7 },
            { userId: 'demo_6', userName: 'GraphGuru', xp: 480, streak: 3 },
            { userId: 'demo_7', userName: 'FormulaFan', xp: 390, streak: 6 },
            { userId: 'demo_8', userName: 'ProofPro', xp: 310, streak: 4 }
        ];
    }

    // Search users
    searchUsers(query) {
        if (!query || query.length < 2) return [];
        
        const allUsers = this.getAllUsers();
        const friends = this.getFriends();
        const friendIds = friends.map(f => f.userId);
        
        return allUsers
            .filter(u => 
                u.userId !== this.userId && // Not self
                !friendIds.includes(u.userId) && // Not already friend
                u.userName.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 10); // Limit results
    }

    // Friend Requests
    sendFriendRequest(targetUserId) {
        const requests = JSON.parse(localStorage.getItem(`reckonRequests_${this.userId}`) || '{"incoming":[],"outgoing":[]}');
        
        // Check if already sent
        if (requests.outgoing.includes(targetUserId)) {
            return { success: false, error: 'Request already sent' };
        }

        // Add to outgoing
        requests.outgoing.push(targetUserId);
        localStorage.setItem(`reckonRequests_${this.userId}`, JSON.stringify(requests));

        // For demo users, auto-accept after 2 seconds
        if (targetUserId.startsWith('demo_')) {
            setTimeout(() => {
                const currentRequests = JSON.parse(localStorage.getItem(`reckonRequests_${this.userId}`) || '{"incoming":[],"outgoing":[]}');
                const index = currentRequests.outgoing.indexOf(targetUserId);
                if (index > -1) {
                    currentRequests.outgoing.splice(index, 1);
                    localStorage.setItem(`reckonRequests_${this.userId}`, JSON.stringify(currentRequests));
                    
                    // Add as friend
                    const friends = JSON.parse(localStorage.getItem(`reckonFriends_${this.userId}`) || '[]');
                    friends.push(targetUserId);
                    localStorage.setItem(`reckonFriends_${this.userId}`, JSON.stringify(friends));
                }
            }, 2000);
        }

        return { success: true };
    }

    getIncomingRequests() {
        const requests = JSON.parse(localStorage.getItem(`reckonRequests_${this.userId}`) || '{"incoming":[],"outgoing":[]}');
        const allUsers = this.getAllUsers();
        
        return requests.incoming
            .map(userId => allUsers.find(u => u.userId === userId))
            .filter(u => u); // Remove nulls
    }

    getOutgoingRequests() {
        const requests = JSON.parse(localStorage.getItem(`reckonRequests_${this.userId}`) || '{"incoming":[],"outgoing":[]}');
        const allUsers = this.getAllUsers();
        
        return requests.outgoing
            .map(userId => allUsers.find(u => u.userId === userId))
            .filter(u => u);
    }

    acceptFriendRequest(fromUserId) {
        const requests = JSON.parse(localStorage.getItem(`reckonRequests_${this.userId}`) || '{"incoming":[],"outgoing":[]}');
        
        // Remove from incoming
        requests.incoming = requests.incoming.filter(id => id !== fromUserId);
        localStorage.setItem(`reckonRequests_${this.userId}`, JSON.stringify(requests));

        // Add to friends
        const friends = JSON.parse(localStorage.getItem(`reckonFriends_${this.userId}`) || '[]');
        friends.push(fromUserId);
        localStorage.setItem(`reckonFriends_${this.userId}`, JSON.stringify(friends));

        return { success: true };
    }

    declineFriendRequest(fromUserId) {
        const requests = JSON.parse(localStorage.getItem(`reckonRequests_${this.userId}`) || '{"incoming":[],"outgoing":[]}');
        
        // Remove from incoming
        requests.incoming = requests.incoming.filter(id => id !== fromUserId);
        localStorage.setItem(`reckonRequests_${this.userId}`, JSON.stringify(requests));

        return { success: true };
    }

    // Friends Management
    getFriends() {
        const friendIds = JSON.parse(localStorage.getItem(`reckonFriends_${this.userId}`) || '[]');
        const allUsers = this.getAllUsers();
        
        return friendIds
            .map(userId => allUsers.find(u => u.userId === userId))
            .filter(u => u) // Remove nulls
            .sort((a, b) => b.xp - a.xp); // Sort by XP
    }

    removeFriend(friendUserId) {
        const friends = JSON.parse(localStorage.getItem(`reckonFriends_${this.userId}`) || '[]');
        const filtered = friends.filter(id => id !== friendUserId);
        localStorage.setItem(`reckonFriends_${this.userId}`, JSON.stringify(filtered));
        return { success: true };
    }

    // Stats
    getFriendCount() {
        const friends = JSON.parse(localStorage.getItem(`reckonFriends_${this.userId}`) || '[]');
        return friends.length;
    }

    getPendingRequestCount() {
        const requests = JSON.parse(localStorage.getItem(`reckonRequests_${this.userId}`) || '{"incoming":[],"outgoing":[]}');
        return requests.incoming.length;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.FriendsSystem = FriendsSystem;
}
