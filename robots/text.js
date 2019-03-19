const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../robots/credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

const watsonApiKey = require('../robots/credentials/watson-nlu.json').apikey


const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
 
var nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
  });


async function robot(content) {
    await fecthContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

    async function fecthContentFromWikipedia(content){
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2?timeout=300")
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()
        
        content.sourceContentOriginal = wikipediaContent.content   
    }

    function sanitizeContent(content){
        const withoutBlankLinesAndMarkdown = removeBlankLinesMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)
        
        content.sourceContentSanitized = withoutDatesInParentheses

        //console.log(withoutDatesInParentheses)


        function removeBlankLinesMarkdown(text){

            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if(line.trim().length === 0 || line.trim().startsWith('=')){
                    return false
                }

                return true
            })

            return withoutBlankLinesAndMarkdown.join(' ')
        }
    }

    function removeDatesInParentheses(text){
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }

   
    function breakContentIntoSentences(content) {

        content.sentences = []
        
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) => {
            content.sentences.push({
              text: sentence,
              keywords: [],
              images: []
            })
          })
    }
    
    function limitMaximumSentences(content){
        
        content.sentences = content.sentences.slice(0, content.maximumSentences)

    }

    async function fetchKeywordsOfAllSentences(content){

        for (const sentence of content.sentences){

            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)

        }
    }

    async function fetchWatsonAndReturnKeywords(sentence){

        return new Promise((resolve, reject) => {
    
            nlu.analyze(
                {
                  text: sentence,
                  features: {
                    keywords: {}
                  }
                },
                function(err, response) {
                  if (err) {
                    throw err
                  } else {
                    //console.log(JSON.stringify(response, null, 4));
                    const keywords = response.keywords.map((keywords) => {
                        return keywords.text
                    })
    
                    resolve(keywords)
                  }
                }
              )
    
        })
    }

}

module.exports = robot