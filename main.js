let my = {}

/**
 * @constructor
 */
my.List = function (items) {
  this.dragged_ = null
  this.element_ = document.createElement('div')
  this.element_.classList.add('list')
  this.placeholder_ = document.createElement('div')
  this.placeholder_.classList.add('list__placeholder')
  items.forEach((item) => this.element_.appendChild(this.renderItem_(item)))
  this.element_.addEventListener('mousedown', this.handleMouseDown_.bind(this))
  document.addEventListener('mousemove', this.handleMouseMove_.bind(this))
  document.addEventListener('mouseover', this.handleMouseOver_.bind(this))
}
/** @return {Element} */
my.List.prototype.getElement = function () {
  return this.element_
}
/**
 * @return {Element}
 * @private
 */
my.List.prototype.renderItem_ = function (item) {
  let el = document.createElement('div')
  el.classList.add('list__item')
  let handle = document.createElement('div')
  handle.classList.add('list__handle')
  let content = document.createElement('div')
  content.classList.add('list__content')
  content.innerHTML = item
  el.appendChild(handle)
  el.appendChild(content)
  return el
}
/** 
 * @private
 */
my.List.prototype.handleMouseOver_ = function (ev) {
  console.log('over')
  if (null === this.dragged_) return
  if (ev.target === this.placeholder_) return
  let itemEl = ev.target.parentNode
  if (undefined === itemEl.classList) return
  if (!itemEl.classList.contains('list__item')) return
  let rect = itemEl.getBoundingClientRect()
  let below = rect.top + rect.height / 2
  let mouseIsBelow = below < ev.clientY
  let childIndex = Array.prototype.indexOf.call(this.element_.children, itemEl)
  let otherItem = this.element_.children[childIndex]
  if (mouseIsBelow) {
    otherItem.insertAdjacentElement('afterEnd', this.placeholder_)
  }
  else {
    otherItem.insertAdjacentElement('beforebegin', this.placeholder_)
  }
}
/**
 * @private
 */
my.List.prototype.handleMouseMove_ = function (ev) {
  if (null === this.dragged_) return
  const offset = 10;
  this.dragged_.style.top = (ev.clientY + offset).toString() + 'px'
  this.dragged_.style.left = (ev.clientX + offset).toString() + 'px'
}
/**
 * @private
 */
my.List.prototype.handleMouseDown_ = function (ev) {
  if (ev.target.classList.contains('list__handle')) {
    this.handleMouseDownOnHandle_(ev)
  }
  else if (ev.target.classList.contains('list__placeholder')) {
    this.handleMouseDownOnPlaceholder_(ev)
  }
}
/**
 * @private
 */
my.List.prototype.handleMouseDownOnHandle_ = function (ev) {
  let itemEl = ev.target.parentNode
  itemEl.classList.add('list__item--dragged')
  this.dragged_ = itemEl
}
/**
 * @private
 */
my.List.prototype.handleMouseDownOnPlaceholder_ = function (ev) {
  this.placeholder_.insertAdjacentElement('afterend', this.dragged_)
  this.dragged_.classList.remove('list__item--dragged')
  this.placeholder_.remove()
  this.dragged_ = null
}

window.addEventListener('load', () => {
  let container = document.querySelector('.container')
  let items = [
    'OCaml',
    'Clojure',
    'Rust',
    'Elixir'
  ]
  let list = new my.List(items)
  container.appendChild(list.getElement())
})
