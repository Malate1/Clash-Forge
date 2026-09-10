/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Updated to the new Supercell Store deep slate palette
        void: '#0f141e',        // The deep dark background
        panel: '#182030',       // The chunky dark card backgrounds
        'panel-alt': '#242f45', // Lighter variant for inner cards/hover states
        hairline: '#334155',    // slate-700 equivalent for borders
        
        // Updated to authentic vibrant game colors
        gold: '#ffc800',        // Bright Clash Gold
        'gold-dim': '#d97706',  // Darker gold/amber for shadows or progress bars
        ember: '#ef4444',       // Vibrant clash red
        ink: '#f8fafc',         // Bright crisp text (slate-50)
        'ink-dim': '#94a3b8',   // Muted descriptive text (slate-400)
        elixir: '#d946ef',      // Vibrant elixir pink/purple
        
        // Brand new additions for the Store UI
        supercell: '#2a77f4',   // Iconic Supercell blue button color
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'sans-serif'], // Kept as fallback
        body: ['Inter', 'sans-serif'],                      // Kept as fallback
        clash: ['Clash_Regular', 'Inter']              // Your properly configured font!
      },

      clipPath: {
        // Kept for backward compatibility just in case, 
        // though the new UI heavily favors rounded corners (rounded-2xl)
        corner: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)'
      }
    }
  },
  plugins: []
}