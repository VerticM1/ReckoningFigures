// Auto-Sync System for Reckoning Figures
// Reads localStorage and syncs to Firebase automatically
// No modifications to figure files needed!

class AutoSync {
    constructor() {
        this.auth = window.firebaseAuth;
        this.db = window.firebaseDB;
        this.syncInterval = null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.auth && this.auth.currentUser;
    }

    // Get data from localStorage
    getLocalProgress() {
        try {
            const progress = localStorage.getItem('reckonProgress');
            if (!progress) return null;
            
            return JSON.parse(progress);
        } catch (error) {
            console.error('Error reading localStorage:', error);
            return null;
        }
    }

    // Sync localStorage data to Firebase
    async syncToFirebase() {
        if (!this.isAuthenticated()) {
            console.log('⏸️  Not authenticated - skipping sync');
            return { success: false, reason: 'not_authenticated' };
        }

        const localData = this.getLocalProgress();
        if (!localData) {
            console.log('⏸️  No local data to sync');
            return { success: false, reason: 'no_data' };
        }

        try {
            const userId = this.auth.currentUser.uid;
            const userRef = this.db.collection('users').doc(userId);

            // Get current Firebase data
            const doc = await userRef.get();
            
            if (!doc.exists) {
                console.log('❌ User document not found');
                return { success: false, reason: 'no_user_doc' };
            }

            const firebaseData = doc.data();
            
            // Prepare update (only update if local data is newer/higher)
            const updates = {};
            let hasUpdates = false;

            // XP: Use higher value
            if ((localData.xp || 0) > (firebaseData.xp || 0)) {
                updates.xp = localData.xp || 0;
                hasUpdates = true;
            }

            // Streak: Use higher value (called bestQuestionStreak in localStorage, streak in Firebase)
            const localStreak = localData.bestQuestionStreak || localData.streak || 0;
            if (localStreak > (firebaseData.streak || 0)) {
                updates.streak = localStreak;
                hasUpdates = true;
            }

            // Completed figures: Merge arrays
            if (localData.completed && Array.isArray(localData.completed)) {
                const firebaseCompleted = firebaseData.completed || [];
                const mergedCompleted = [...new Set([...firebaseCompleted, ...localData.completed])];
                
                if (mergedCompleted.length > firebaseCompleted.length) {
                    updates.completed = mergedCompleted;
                    hasUpdates = true;
                }
            }

            // Update timestamp
            if (hasUpdates) {
                updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                
                await userRef.update(updates);
                console.log('✅ Synced to Firebase:', updates);
                return { success: true, updates };
            } else {
                console.log('✨ Already in sync!');
                return { success: true, reason: 'already_synced' };
            }

        } catch (error) {
            console.error('❌ Sync failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Sync Firebase data back to localStorage (for cross-device)
    async syncFromFirebase() {
        if (!this.isAuthenticated()) {
            return { success: false, reason: 'not_authenticated' };
        }

        try {
            const userId = this.auth.currentUser.uid;
            const userRef = this.db.collection('users').doc(userId);
            const doc = await userRef.get();

            if (!doc.exists) {
                return { success: false, reason: 'no_user_doc' };
            }

            const firebaseData = doc.data();
            const localData = this.getLocalProgress() || {};

            // Merge: take highest values
            const merged = {
                userName: localData.userName || firebaseData.userName || 'Player',
                xp: Math.max(localData.xp || 0, firebaseData.xp || 0),
                bestQuestionStreak: Math.max(
                    localData.bestQuestionStreak || 0,
                    firebaseData.streak || 0
                ),
                completed: [...new Set([
                    ...(localData.completed || []),
                    ...(firebaseData.completed || [])
                ])]
            };

            // Save merged data back to localStorage
            localStorage.setItem('reckonProgress', JSON.stringify(merged));
            console.log('✅ Synced from Firebase to localStorage');
            return { success: true, merged };

        } catch (error) {
            console.error('❌ Sync from Firebase failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Full bi-directional sync
    async fullSync() {
        console.log('🔄 Starting full sync...');
        
        // First sync from Firebase (get latest from other devices)
        await this.syncFromFirebase();
        
        // Then sync to Firebase (push any local changes)
        const result = await this.syncToFirebase();
        
        console.log('🔄 Full sync complete!');
        return result;
    }

    // Start auto-sync (syncs every 30 seconds while page is open)
    startAutoSync(intervalSeconds = 30) {
        // Do initial sync
        this.fullSync();

        // Set up periodic sync
        this.syncInterval = setInterval(() => {
            this.fullSync();
        }, intervalSeconds * 1000);

        console.log(`🔄 Auto-sync started (every ${intervalSeconds}s)`);
    }

    // Stop auto-sync
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('⏸️  Auto-sync stopped');
        }
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.AutoSync = AutoSync;
    
    // Auto-initialize if Firebase is ready
    window.addEventListener('DOMContentLoaded', () => {
        if (window.firebaseAuth && window.firebaseDB) {
            window.autoSync = new AutoSync();
            console.log('✅ AutoSync ready!');
        }
    });
}
