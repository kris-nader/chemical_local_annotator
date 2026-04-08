const fs = require('fs');

console.log('Reading data.json...');
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
console.log('Original drugs count:', Object.keys(data.drugs).length);
console.log('Original search items:', data.search.length);

const isHumanTarget = t => (t.organism || '').toLowerCase().includes('homo sapiens');

const newDrugs = {};
const newSearch = [];

Object.keys(data.drugs).forEach(key => {
    const drug = data.drugs[key];
    
    // Check if it has any human targets *before* we potentially filter out MOA pseudo targets.
    // Actually, just directly filter targets.
    drug.targets = drug.targets.filter(isHumanTarget);
    
    // Only keep drug if it has human targets or if we want to keep all drugs?
    // The user said "dont even bother with the toggle just show human targets".
    // When the toggle was on, we filtered drugs that had drug.targets.some(isHumanTarget).
    // Now we explicitly only keep those drugs.
    if (drug.targets.length > 0) {
        newDrugs[key] = drug;
    }
});

// Re-build the search array keeping only keys that exist in newDrugs
data.search.forEach(item => {
    if (newDrugs[item.key]) {
        newSearch.push(item);
    }
});

const output = {
    drugs: newDrugs,
    search: newSearch
};

console.log('Filtered drugs count:', Object.keys(newDrugs).length);
console.log('Filtered search items:', newSearch.length);

console.log('Writing back to data.json...');
fs.writeFileSync('data.json', JSON.stringify(output));
console.log('Done!');
