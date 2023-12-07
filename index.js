const fs = require('fs');
const filePath = './buildList.sqf';

function extractData(buildList, line, currentType) {
	// remove all `[` and `]` and `"` from the line
	line = line.replace(/\[/g, '');
	line = line.replace(/\]/g, '');
	line = line.replace(/"/g, '');
	// split the line into an array of strings
	line = line.split(',')
	const className = line[0];
	let supply = line[1];
	let ammo = line[2];
	let fuel = line[3];
	
	// supply, ammo, and fuel are all numbers
	supply = parseInt(supply);
	ammo = parseInt(ammo);
	fuel = parseInt(fuel);

	// some lines have a description of the vehicle, some don't
	const description = line[4] ? line[4] : null;

	// if supply, ammo, and fuel are all 0, then dont push it
	if (supply !== 0 || ammo !== 0 || fuel !== 0) { 
		buildList.push({
			type: currentType,
			className,
			supply,
			ammo,
			fuel,
			description,
		});
	}
}

// Read the file asynchronously
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // remove all spaces, tabs, indents, and newlines
    data = data.replace(/ /g, '');
    data = data.replace(/\r/g, '');
    data = data.replace(/\t/g, '');

    const lines = data.split('\n');
	const buildList = [];
    
	let currentType = '';
    lines.forEach(line => {
        if (line.endsWith('[')) {
            line = line.split('=');
			currentType = line[0];
        } else if (line.startsWith('["') && line.endsWith('],')) {
            extractData(buildList, line, currentType);
		} else if (line.startsWith('["') && line.endsWith(']')) {
			extractData(buildList, line, currentType);
		}
	});

	// get all the unique types
	const types = [];
	buildList.forEach(item => {
		if (!types.includes(item.type)) {
			types.push(item.type);
		}
	});

	// create the output file
	const output = {};
	types.forEach(type => {
		output[type] = [];
	});

	// sort the buildList by type
	buildList.forEach(item => {
		output[item.type].push(item);
	});

	// write the output file
	fs.writeFile('./buildList.json', JSON.stringify(output, null, 4), err => {
		if (err) {
			console.error('Error writing file:', err);
			return;
		}
		console.log('File written successfully');
	});
});