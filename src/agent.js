const assert = require('assert')
const makeRequest = require('./make-request')
const { log } = require('./utils')
const strings = require('./strings')

module.exports = NotionAgent

function NotionAgent(options) {

  assert(options.cookie, strings.AGENT_CONSTRUCT_FAIL)

  const cookie = options.cookie
  const pathBase = '/api/v3/'

  /**
   * Make a request to Notion API.
   * @param {string} apiURL - Notion API URL.
   * @param {string} requestData - Request body.
   * @returns {Promise.<object>} JSON object from response.
   */
  function makeRequestToNotion(apiURL, requestData) {

    const agentOptions = {
      hostname: 'www.notion.so',
      port: 443,
      path: '',
      method: 'POST',
      authority: 'www.notion.so',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate',
        'content-length': 0,
        'content-type': 'application/json',
        'cookie': cookie,
        'origin': 'https://www.notion.so',
        'referer': 'https://www.notion.so',
        'user-agent': strings.REQUEST_USER_AGENT
      }
    }

    Object.defineProperty(
      agentOptions,
      'path',
      { writable: true, value: apiURL }
    )

    Object.defineProperty(
      agentOptions.headers,
      'content-length',
      { writable: true, value: requestData.length }
    )

    return makeRequest(agentOptions, requestData)

  }

  /**
   * Execute a raw call to /api/v3/loadPageChunk
   * @param {string} pageID - The page ID to request.
   * @param {number} chunkNo - The chunk number to request.
   * @param {object} cursor - The cursor.
   * @returns {Promise.<object>} JSON object from response.
   */
  this.loadPageChunk = (pageID, chunkNo, cursor) => {

    assert(pageID, strings.PAGEID_NOT_FOUND)

    const apiURL = pathBase + 'loadPageChunk'
    log(`Sending request: ${apiURL}`)

    const requestData = JSON.stringify({
      "pageId": pageID,
      "limit": cursor ? 30 : 50,
      "cursor": cursor ? cursor : { "stack": [] },
      "chunkNumber": chunkNo ? chunkNo : 0,
      "verticalColumns": false
    })

    return makeRequestToNotion(apiURL, requestData)

  }

  /**
   * Execute a raw call to /api/v3/getAssetsJson
   * @returns {Promise.<object>} JSON object from response.
   */
  this.getAssetsJson = () => {

    const apiURL = pathBase + 'getAssetsJson'
    log(`Sending request: ${apiURL}`)

    const requestData = JSON.stringify({})

    return makeRequestToNotion(apiURL, requestData)

  }

  /**
   * A request object in the requests array for getRecordValues.
   * @typedef {object} RecordRequest
   * @property {string} table - The table to query.
   * @property {string} id - ID of a item.
   */

  /**
   * Execute a raw call to /api/v3/getRecordValues
   * @param {RecordRequest[]} requests - The requests to make.
   * @returns {Promise.<object>} JSON object from response.
   */
  this.getRecordValues = (requests) => {

    assert(Array.isArray(requests), strings.IDS_NOT_ARRAY)

    const apiURL = pathBase + 'getRecordValues'
    log(`Sending request: ${apiURL}`)

    const requestData = JSON.stringify({
      "requests": requests.map((request) => {
        return {
          "table": request.table,
          "id": request.id
        }
      })
    })

    return makeRequestToNotion(apiURL, requestData)

  }

  /**
   * Execute a raw call to /api/v3/loadUserContent
   * @returns {Promise.<object>} JSON object from response.
   */
  this.loadUserContent = () => {

    const apiURL = pathBase + 'loadUserContent'
    log(`Sending request: ${apiURL}`)

    const requestData = JSON.stringify({})

    return makeRequestToNotion(apiURL, requestData)

  }

  /**
   * An aggregate query.
   * @typedef AggregateQuery
   * @property {string} id
   * @property {string} type
   * @property {string} property
   * @property {string} view_type
   * @property {string} aggregation_type
   */

  /**
   * Info of a user.
   * @typedef User
   * @property {string} timeZone
   * @property {string} locale
   */

  /**
   * Execute a raw call to /api/v3/queryCollection
   * @param {string} collectionID
   * @param {string} collectionViewID
   * @param {AggregateQuery[]} aggregateQueries
   * @param {User} user
   * @returns {Promise.<object>} JSON object from response.
   */
  this.queryCollection = (collectionID, collectionViewID, aggregateQueries, user) => {

    assert(collectionID, strings.COLLECTION_ID_NOT_FOUND)
    assert(collectionViewID, strings.COLLECTION_VIEW_ID_NOT_FOUND)
    assert(Array.isArray(aggregateQueries), strings.AGGREGATEQUERIES_NOT_ARRAY)
    assert(user.timeZone, strings.USER_TIMEZONE_NOT_FOUND)
    assert(user.locale, strings.USER_LOCALE_NOT_FOUND)

    const apiURL = pathBase + 'queryCollection'
    log(`Sending request: ${apiURL}`)

    const requestData = JSON.stringify({
      "collectionId": collectionID,
      "collectionViewId": collectionViewID,
      "query": {
        "aggregate": aggregateQueries,
        "filter_operator": "and",
        "filter": [],
        "sort": []
      },
      "loader": {
        "type": "table",
        "limit": 70,
        "userTimeZone": user.timeZone,
        "userLocale": user.locale,
        "loadContentCover": true
      }
    })

    return makeRequestToNotion(apiURL, requestData)

  }

}