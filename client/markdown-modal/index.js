var modal = require('./client/modal')

module.exports = modal({
  closable: true,
  width: '640px',
  template: require('./template.html')
})
