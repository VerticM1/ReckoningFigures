// Reckoning Figures - Progress Sync System
// Syncs user progress (XP, streak, completed figures) to Firebase in real-time

class ProgressSync {
    constructor() {
        this.auth = window.firebaseAuth;
        this.db = window.firebaseDB;
        this.currentUser = null;
        this.syncEnabled = false;
    }

    async initialize() {
        // Wait for auth
        return new Promise((resolve) => {
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.syncEnabled = !!user;
                resolve(user);
            });
        });
    }

    // Update user's XP and streak in Firebase
    async syncProgress(xp, streak, completed = []) {
        if (!this.syncEnabled || !this.currentUser) {
            console.log('Progress sync skipped - not logged in');
            return;
        }

        try {
            const userRef = this.db.collection('users').doc(this.currentUser.uid);
            
            await userRef.update({
                xp: xp,
                streak: streak,
                completed: completed,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('Progress synced to Firebase:', { xp, streak, completed: completed.length });
        } catch (error) {
            console.error('Failed to sync progress:', error);
            // Don't throw - let game continue even if sync fails
        }
    }

    // Called whenever user gains XP
    async addXP(amount) {
        const progress = this.getLocalProgress();
        progress.xp = (progress.xp || 0) + amount;
        
        // Update localStorage immediately
        localStorage.setItem('reckonProgress', JSON.stringify(progress));
        
        // Sync to Firebase
        await this.syncProgress(progress.xp, progress.streak, progress.completed);
        
        return progress.xp;
    }

    // Called when user completes a figure
    async completeFigure(figureId) {
        const progress = this.getLocalProgress();
        
        if (!progress.completed) {
            progress.completed = [];
        }
        
        if (!progress.completed.includes(figureId)) {
            progress.completed.push(figureId);
        }
        
        // Update localStorage
        localStorage.setItem('reckonProgress', JSON.stringify(progress));
        
        // Sync to Firebase
        await this.syncProgress(progress.xp, progress.streak, progress.completed);
    }

    // Called when user updates streak
    async updateStreak(streak) {
        const progress = this.getLocalProgress();
        progress.streak = streak;
        
        // Update localStorage
        localStorage.setItem('reckonProgress', JSON.stringify(progress));
        
        // Sync to Firebase
        await this.syncProgress(progress.xp, progress.streak, progress.completed);
    }

    // Get progress from localStorage
    getLocalProgress() {
        return JSON.parse(localStorage.getItem('reckonProgress') || '{"xp": 0, "streak": 0, "completed": []}');
    }

    // Load progress from Firebase (for syncing across devices)
    async loadFromFirebase() {
        if (!this.syncEnabled || !this.currentUser) {
            return null;
        }

        try {
            const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
            
            if (userDoc.exists) {
                const data = userDoc.data();
                return {
                    xp: data.xp || 0,
                    streak: data.streak || 0,
                    completed: data.completed || []
                };
            }
            
            return null;
        } catch (error) {
            console.error('Failed to load from Firebase:', error);
            return null;
        }
    }

    // Merge local and Firebase progress (use highest values)
    async mergeProgress() {
        const localProgress = this.getLocalProgress();
        const firebaseProgress = await this.loadFromFirebase();
        
        if (!firebaseProgress) {
            // No Firebase data yet - upload local
            await this.syncProgress(localProgress.xp, localProgress.streak, localProgress.completed);
            return localProgress;
        }
        
        // Merge: take highest XP and streak, combine completed arrays
        const merged = {
            xp: Math.max(localProgress.xp || 0, firebaseProgress.xp || 0),
            streak: Math.max(localProgress.streak || 0, firebaseProgress.streak || 0),
            completed: [...new Set([...(localProgress.completed || []), ...(firebaseProgress.completed || [])])]
        };
        
        // Save merged to both
        localStorage.setItem('reckonProgress', JSON.stringify(merged));
        await this.syncProgress(merged.xp, merged.streak, merged.completed);
        
        return merged;
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.ProgressSync = ProgressSync;
}
