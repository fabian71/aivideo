const readline = require('readline-sync')
const robots = {
	text: require('./robots/text')
}

async function start(){
	const content = {
		maximumSentences: 7
	}

	content.searchTerm = askAndReturnSearchTerm()
	content.prefix = askAndReturnPrefix()

	await robots.text(content)

	function askAndReturnSearchTerm(){
		return readline.question('Type a Wikipedia search term: ')
	}
	
	function askAndReturnPrefix(){
		const prefixes = ['Who is', 'What is', 'The history of']
		const selectPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
		const selectPrefixTest = prefixes[selectPrefixIndex]
		return selectPrefixTest
	}

	console.log(JSON.stringify(content, null, 4))
}



start()
