// Daily Activity Tracker for Reckoning Figures
// Include this in figure pages to track daily streaks

(function() {
    // Mark today as active when a figure is completed
    window.markDailyActivity = function() {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        let dailyActivity = JSON.parse(localStorage.getItem('dailyActivity') || '{}');
        
        if (!dailyActivity[today]) {
            dailyActivity[today] = true;
            localStorage.setItem('dailyActivity', JSON.stringify(dailyActivity));
            console.log('✅ Daily activity marked for', today);
        }
    };
    
    // Auto-mark today when page loads (user is playing)
    window.markDailyActivity();
})();
