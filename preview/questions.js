// Preserved verbatim from duolingo-math.html. Figure 001.
        export const problems = [
            // Conceptual understanding
            { 
                type: 'multiple-choice',
                eq: 'x + 5 = 12', 
                q: 'What should we do first to solve for <span class="var">x</span>?', 
                choices: ['Subtract 5 from both sides', 'Add 5 to both sides', 'Divide both sides by 5'], 
                answer: 0 
            },
            // Basic arithmetic
            { 
                type: 'multiple-choice',
                eq: 'x = 12 − 5', 
                q: 'What does 12 − 5 equal?', 
                choices: ['7', '17', '5'], 
                answer: 0 
            },
            // Fill in the blank
            {
                type: 'fill-blank',
                eq: 'x + ___ = 15',
                q: 'If <span class="var">x</span> = 8, what number goes in the blank?',
                answer: '7',
                placeholder: 'Enter number'
            },
            // Standard solve
            { 
                type: 'multiple-choice',
                eq: 'x + 7 = 15', 
                q: 'Solve for <span class="var">x</span>', 
                choices: ['x = 6', 'x = 8', 'x = 22'], 
                answer: 1 
            },
            // True/False conceptual
            {
                type: 'true-false',
                eq: 'x + 9 = 20',
                q: 'To solve this equation, we add 9 to both sides.',
                answer: false
            },
            // Standard solve
            { 
                type: 'multiple-choice',
                eq: 'x + 12 = 25', 
                q: 'Solve for <span class="var">x</span>', 
                choices: ['x = 11', 'x = 13', 'x = 37'], 
                answer: 1 
            },
            // Fill in the blank
            {
                type: 'fill-blank',
                eq: 'x + 6 = 18',
                q: 'What is <span class="var">x</span>?',
                answer: '12',
                placeholder: 'x = ?'
            },
            // Standard solve with bigger numbers
            { 
                type: 'multiple-choice',
                eq: 'x + 15 = 38', 
                q: 'Solve for <span class="var">x</span>', 
                choices: ['x = 21', 'x = 23', 'x = 53'], 
                answer: 1 
            },
            // Equation on right side
            { 
                type: 'multiple-choice',
                eq: '23 = x + 8', 
                q: 'Solve for <span class="var">x</span>', 
                choices: ['x = 13', 'x = 15', 'x = 31'], 
                answer: 1 
            }
        ];
