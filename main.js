let my = {}

/**
 * @param {Object} tree
 * @constructor
 */
my.Tree = function (tree) {
  /**
   * @type {?Element}
   * @private
   */
  this.element_ = document.createElement('div')
  this.element_.classList.add('tree')
  let rendered = this.renderTree_(tree)
  this.element_.appendChild(rendered)
  this.element_.addEventListener('mousemove',
                                 this.handleMouseMove_.bind(this))
  this.element_.addEventListener('click',
                                 this.handleClick_.bind(this))
  this.element_.addEventListener('mouseover',
                                 this.handleMouseOver_.bind(this))
  this.element_.addEventListener('mouseout',
                                 this.handleMouseOut_.bind(this))
  /**
   * @type {?Element}
   * @private
   */
  this.dragged_ = null

  /**
   * @type {Element}
   * @private
   */
  this.placeholder_ = this.createPlaceholder_()

  /**
   * A timestamp that is updated when the placeholder is moved
   * @type {number}
   * @private
   */
  this.placeholderUpdated_ = 0
}
/**
 * Number of miliseconds that must pass after the placeholder's
 * position has been moved and before it is moved again.
 * @type {number}
 */
my.Tree.MIN_PLACEHOLDER_INTERVAL_ = 150

/**
 * @return {Element}
 */
my.Tree.prototype.createPlaceholder_ = function () {
  let el = document.createElement('div')
  el.classList.add('tree__placeholder')
  return el
}

/**
 * @return {Element}
 */
my.Tree.prototype.getElement = function () {
  return this.element_
}

/**
 * @return {void}
 * @private
 */
my.Tree.prototype.handleMouseOver_ = function (ev) {
  if (ev.target.classList.contains('tree__leaf')) {
    const branchEl = ev.target.parentNode.parentNode
    this.highlightBranch_(branchEl, true)
  }
}

/**
 * @return {void}
 * @private
 */
my.Tree.prototype.handleMouseOut_ = function (ev) {
  if (ev.target.classList.contains('tree__leaf')) {
    const branchEl = ev.target.parentNode.parentNode
    this.highlightBranch_(branchEl, false)
  }
}

/**
 * @return {void}
 * @private
 */
my.Tree.prototype.handleMouseMove_ = function (ev) {
  if (this.dragged_ === null) return
  const offset = 10
  this.dragged_.style.top = (ev.clientY + offset).toString() + 'px'
  this.dragged_.style.left = (ev.clientX + offset).toString() + 'px'
  const target = ev.target
  if (target.classList.contains('tree__leaf')) {
    this.handleHoverLeaf_(ev)
  }
  else if (target.classList.contains('tree__content')) {
    this.handleHoverContent_(ev)
  }
  else if (target.classList.contains('tree__branch')) {
    this.handleHoverBranch_(ev)
  }
}

/**
 * @param {MouseEvent} ev
 * @return {void}
 * @private
 */
my.Tree.prototype.handleHoverBranch_ = function (ev) {
  if (this.dragged_ === null) return
  const rect = ev.target.getBoundingClientRect()
  let direction = null
  if (ev.target.classList.contains('tree__branch--row')) {
    direction = my.Direction.ROW
  }
  else if (ev.target.classList.contains('tree__branch--column')) {
    direction = my.Direction.COLUMN
  }
  else {
    throw new Error('unknown direction')
  }
  let mouse = 0
  let center = 0
  if (direction === my.Direction.ROW) {
    center = rect.left + rect.width / 2
    mouse = ev.clientX
  }
  else {
    center = rect.top + rect.height / 2
    mouse = ev.clientY
  }
  let placeholderLocation = ''
  if (mouse < center) {
    placeholderLocation = 'beforebegin'
  }
  else {
    placeholderLocation = 'afterend'
  }
  const now = Date.now()
  if (my.Tree.MIN_PLACEHOLDER_INTERVAL_ < now - this.placeholderUpdated_) {
    this.placeholderUpdated_ = now
    ev.target.insertAdjacentElement(placeholderLocation, this.placeholder_)
  }
}

/**
 * @param {MouseEvent} ev
 * @return {void}
 * @private
 */
my.Tree.prototype.handleHoverLeaf_ = function (ev) {
  if (!ev.target.classList.contains('tree__leaf')) {
    throw new Error('expected a leaf')
  }
  const parentEl = ev.target.parentNode.parentNode
  let direction = null
  if (parentEl.classList.contains('tree__branch--row')) {
    direction = my.Direction.ROW
  }
  else if (parentEl.classList.contains('tree__branch--column')) {
    direction = my.Direction.COLUMN
  }
  else {
    throw new Error('unknown direction')
  }
  const rect = ev.target.getBoundingClientRect()
  let center = 0
  let mousePos = 0
  if (direction === my.Direction.ROW) {
    center = rect.left + rect.width / 2.0
    mousePos = ev.clientX
  }
  else {
    center = rect.top + rect.height / 2.0
    mousePos = ev.clientY
  }
  let insertion = ''
  if (mousePos < center) {
    insertion = 'beforebegin'
  }
  else {
    insertion = 'afterend'
  }
  const now = Date.now()
  if (my.Tree.MIN_PLACEHOLDER_INTERVAL_ < now - this.placeholderUpdated_) {
    this.placeholderUpdated_ = now
    ev.target.insertAdjacentElement(insertion, this.placeholder_)
  }
}

/**
 * @param {Element} branchEl
 * @param {boolean} highlight
 * @private
 * @return {void}
 */
my.Tree.prototype.highlightBranch_ = function (branchEl, highlight) {
  const modifier = 'tree__branch--highlighted'
  if (highlight) {
    branchEl.classList.add(modifier)
  }
  else {
    branchEl.classList.remove(modifier)
  }
}

/**
 * @return {void}
 * @private
 */
my.Tree.prototype.handleClickOnLeaf_ = function (ev) {
  if (this.dragged_ !== null) return
  ev.target.classList.add('tree__leaf--dragged')
  this.dragged_ = ev.target
}

/**
 * @return {void}
 * @private
 */
my.Tree.prototype.handleClickOnHandle_ = function (ev) {
  if (this.dragged_ !== null) return
  let branchEl = ev.target.parentNode
  if (!branchEl.classList.contains('tree__branch')) {
    throw new Error('expected a branch')
  }
  branchEl.classList.add('tree__leaf--dragged')
  this.dragged_ = branchEl  
}

/**
 * @param {MouseEvent} ev
 * @return {void}
 * @private
 */
my.Tree.prototype.handleClickOnPlaceholder_ = function (ev) {
  if (this.dragged_ === null) return
  const childId = parseInt(this.dragged_.dataset['id'], 10)
  const parentEl = this.placeholder_.parentNode.parentNode
  const parentId = parseInt(parentEl.dataset['id'], 10)
  this.placeholder_.insertAdjacentElement('beforebegin', this.dragged_)
  this.placeholder_.remove()
  this.dragged_.classList.remove('tree__leaf--dragged')
  this.dragged_.classList.remove('tree__branch--dragged')
  this.dragged_ = null
  console.log('putting', childId, 'into', parentId)
  console.log('new order:', this.getIds_(parentEl))
}

/**
 * @param {Element} branchEl
 * @return {Array.<number>}
 * @private
 */
my.Tree.prototype.getIds_ = function (branchEl) {
  if (!branchEl.classList.contains('tree__branch')) {
    throw new Error('element is missing class tree__branch')
  }
  const children = branchEl.querySelector('.tree__content').childNodes

  return Array.prototype.map.call(children, (child) => {
    return parseInt(child.dataset['id'], 10)
  })
}

/**
 * @return {void}
 * @private
 */
my.Tree.prototype.handleHoverContent_ = function (ev) {
  if (this.dragged_ === null) return
  const now = Date.now()
  if (my.Tree.MIN_PLACEHOLDER_INTERVAL_ < now - this.placeholderUpdated_) {
    this.placeholderUpdated_ = now
    ev.target.appendChild(this.placeholder_)
  }
}

/**
 * @return {void}
 * @private
 */
my.Tree.prototype.handleClick_ = function (ev) {
  if (ev.target === this.placeholder_) {
    this.handleClickOnPlaceholder_(ev)
  }
  else if (ev.target.classList.contains('tree__leaf')) {
    this.handleClickOnLeaf_(ev)
  }
  else if (ev.target.classList.contains('tree__handle')) {
    this.handleClickOnHandle_(ev)
  }
}

/**
 * @return {Element}
 * @private
 */
my.Tree.prototype.renderTree_ = function(tree) {
  const rootEl = this.createBranch_(tree.id, tree.direction, true)

  const stack = new Array()

  stack.push({
    element: rootEl,
    children: tree.children
  })

  let current = null

  while (current = stack.pop()) {
    const fragment = current.children.reduce((acc, child) => {
      let childEl = null

      switch (child.type) {
      case my.NodeType.BRANCH:
        childEl = this.createBranch_(child.id, child.direction)
        stack.push({element: childEl, children: child.children})
        break;

      case my.NodeType.LEAF:
        childEl = this.createLeaf_(child.id, child.content)
        break;

      default:
        throw new TypeError('unknown node type')
      }

      acc.appendChild(childEl)

      return acc
    }, document.createDocumentFragment())

    current.element.querySelector('.tree__content').appendChild(fragment)
  }
  return rootEl
}

/**
 * @param {string} content
 * @return {Element}
 * @private
 */
my.Tree.prototype.createLeaf_ = function (id, content) {
  if (typeof id !== 'number') throw new TypeError('id must be a number')
  let el = document.createElement('div')
  el.dataset['id'] = id.toString()
  el.classList.add('tree__leaf')
  el.innerHTML = content
  return el
}

/**
 * @param {number} id
 * @param {my.Direction} direction
 * @param {boolean=} opt_root
 * @return {Element}
 * @private
 */
my.Tree.prototype.createBranch_ = function (id, direction, opt_root) {
  opt_root = opt_root || false
  if (typeof id !== 'number') throw new TypeError('id must be a number')
  let el = document.createElement('div')
  if (opt_root) el.classList.add('tree__branch--root')
  el.dataset['id'] = id.toString()
  el.classList.add('tree__branch')
  let dirMod = ''
  if (direction === my.Direction.ROW) {
    dirMod = 'tree__branch--row'
  }
  else if (direction === my.Direction.COLUMN) {
    dirMod = 'tree__branch--column'
  }
  else {
    throw new Error('unknown value for direction')
  }
  el.classList.add(dirMod)
  let handleEl = document.createElement('div')
  handleEl.classList.add('tree__handle')
  el.appendChild(handleEl)
  let contentEl = document.createElement('div')
  contentEl.classList.add('tree__content')
  el.appendChild(contentEl)
  return el
}

/**
 * @enum {number}
 */
my.NodeType = {
  BRANCH: 0,
  LEAF: 1
}

/**
 * @enum {number}
 */
my.Direction = {
  ROW: 0,
  COLUMN: 1
}

window.addEventListener('load', () => {
  let container = document.querySelector('.container')

  const treeData = {
    type: my.NodeType.BRANCH,
    direction: my.Direction.COLUMN,
    id: 1,
    children: [
      {
        type: my.NodeType.LEAF,
        id: 2,
        content: 'OCaml'
      },
      {
        type: my.NodeType.LEAF,
        id: 3,
        content: 'Smalltalk'
      },
      {
        type: my.NodeType.LEAF,
        id: 4,
        content: 'Swift'
      },
      {
        type: my.NodeType.LEAF,
        id: 5,
        content: 'Racket'
      },
      {
        type: my.NodeType.LEAF,
        id: 6,
        content: 'Dart'
      },
      {
        type: my.NodeType.BRANCH,
        id: 7,
        direction: my.Direction.ROW,
        children: [
          {
            type: my.NodeType.LEAF,
            id: 8,
            content: 'Common LISP'
          },
          {
            type: my.NodeType.LEAF,
            id: 9,
            content: 'Scheme'
          },
          {
            type: my.NodeType.LEAF,
            id: 10,
            content: 'Python'
          },
          {
            type: my.NodeType.BRANCH,
            id: 11,
            direction: my.Direction.COLUMN,
            children: [
              {
                type: my.NodeType.LEAF,
                id: 12,
                content: 'COBOL'
              },
              {
                type: my.NodeType.LEAF,
                id: 13,
                content: 'C++'
              },
              {
                type: my.NodeType.LEAF,
                id: 14,
                content: 'Java'
              },
              {
                type: my.NodeType.LEAF,
                id: 15,
                content: 'Elixir'
              },
              {
                type: my.NodeType.BRANCH,
                id: 16,
                direction: my.Direction.ROW,
                children: []
              },
              {
                type: my.NodeType.BRANCH,
                id: 17,
                direction: my.Direction.ROW,
                children: [
                  {
                    type: my.NodeType.LEAF,
                    id: 18,
                    content: 'Rust'
                  },
                  {
                    type: my.NodeType.LEAF,
                    id: 19,
                    content: 'Pascal'
                  },
                  {
                    type: my.NodeType.LEAF,
                    id: 20,
                    content: 'Clojure'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
  let tree = new my.Tree(treeData)
  container.appendChild(tree.getElement())
})
