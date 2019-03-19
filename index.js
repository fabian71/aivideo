const readline = require('readline-sync')
const robots = {
	text: require('./robots/text')
}

async function start(){
	const content = {
		useFecthContentFromWikipediaAlgorithmia: false,
		maximumSentences: 7,
		
	}

	content.searchTerm = askAndReturnSearchTerm()
	content.prefix = askAndReturnPrefix()
	content.lang = askAndReturnLanguage()

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

	function askAndReturnLanguage(){
		const language = ['pt','en']
		const selectedLangIndex = readline.keyInSelect(language,'Choice Language: ')
		const selectedLangText = language[selectedLangIndex]
		return selectedLangText
	  }

	console.log(JSON.stringify(content, null, 4))
}

start()
