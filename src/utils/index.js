import { parser } from 'sql-parser-mistic'
import { default_condition } from './constants'

let o = {},
	toString = o.toString,
	oprop = (o.isPrototypeOf && 'isPrototypeOf') || 'hasOwnProperty',
	undefined

const hasOwn =
	o.hasOwnProperty ||
	function (prop) {
		if (prop in this) {
			var value = this[prop]

			if (!delete this[prop]) {
				return true
			}

			if (!(prop in this) || this[prop] !== value) {
				this[prop] = value
				return true
			}
		}

		return false
	}

export const isPlainObject = function (obj) {
	// Must be an Object.
	if (
		!obj ||
		toString.call(obj) !== '[object Object]' ||
		!(oprop in obj) ||
		hasOwn.call(obj, oprop)
	) {
		return false
	}

	// If constructor is not own, then it must be Object.
	if (
		obj.constructor &&
		!hasOwn.call(obj, 'constructor') &&
		obj.constructor.prototype &&
		!hasOwn.call(obj.constructor.prototype, oprop)
	) {
		return false
	}

	// Also we have to check that all enumerable properties are own.

	// Own properties are enumerated firstly,
	// so if last one is own, then all others are own too.

	// Get last enumerable property.
	var prop
	for (prop in obj) {
		// do nothing
	}

	return prop === undefined || hasOwn.call(obj, prop)
}

export const getSQLFieldID = (field, value, rules) => {
	let matchingRules = rules.filter(
		rule => rule.id.toLowerCase() === field.toLowerCase() // field 字段需要修改
	)

	let id
	if (matchingRules.length === 1) {
		id = matchingRules[0].id
	} else {
		id = ''
		throw new Error("Can't find id")
	}

	return id
}

/**
 * parse "NOT" function from sqlparser
 * @param {*} data
 */
export const parseSQLNode = data => {
	if (data.name && data.name.toUpperCase() == 'NOT') {
		data = data.arguments.value[0]

		// if there is no sub-group, create one
		if (['AND', 'OR'].indexOf(data.operation.toUpperCase()) === -1) {
			data = new parser.nodes.Op(default_condition, data, null)
		}

		data.not = true
	}
}

const Utils = {
	iterateOptions(options, tpl) {
		if (options) {
			if (Array.isArray(options)) {
				options.forEach(function (entry) {
					if (isPlainObject(entry)) {
						// array of elements
						if ('value' in entry) {
							tpl(entry.value, entry.label || entry.value, entry.optgroup)
						}
						// array of one-element maps
						else {
							Object.keys(entry).forEach(key => {
								tpl(key, entry[key])
								return false
							})
							// $.each(entry, function (key, val) {
							// 	tpl(key, val)
							// 	return false // break after first entry
							// })
						}
					}
					// array of values
					else {
						tpl(entry, entry)
					}
				})
			}
			// unordered map
			else {
				Object.keys(options).forEach(key => {
					tpl(key, options[key])
				})
			}
		}
	},
	fmt(str, args) {
		if (!Array.isArray(args)) {
			args = Array.prototype.slice.call(arguments, 1)
		}

		return str.replace(/{([0-9]+)}/g, function (m, i) {
			return args[parseInt(i)]
		})
	},
	error() {
		let i = 0
		let doThrow = typeof arguments[i] === 'boolean' ? arguments[i++] : true
		let type = arguments[i++]
		let message = arguments[i++]
		let args = Array.isArray(arguments[i])
			? arguments[i]
			: Array.prototype.slice.call(arguments, i)

		if (doThrow) {
			let err = new Error(Utils.fmt(message, args))
			err.name = type + 'Error'
			err.args = args
			throw err
		} else {
			console.error(type + 'Error: ' + Utils.fmt(message, args))
		}
	},
	changeType(value, type) {
		if (value === '' || type === undefined) {
			return undefined
		}

		switch (type) {
			case 'integer':
				if (typeof value === 'string' && !/^-?\d+$/.test(value)) {
					return value
				}
				return parseInt(value)
			case 'double':
				if (typeof value === 'string' && !/^-?\d+\.?\d*$/.test(value)) {
					return value
				}
				return parseFloat(value)
			case 'boolean':
				if (
					typeof value === 'string' &&
					!/^(0|1|true|false){1}$/i.test(value)
				) {
					return value
				}
				return (
					value === true ||
					value === 1 ||
					value.toLowerCase() === 'true' ||
					value === '1'
				)
			default:
				return value
		}
	},
	escapeString(value, additionalEscape) {
		if (typeof value != 'string') {
			return value
		}

		let escaped = value
			.replace(/[\0\n\r\b\\\'\"]/g, function (s) {
				switch (s) {
					// @formatter:off
					case '\0':
						return '\\0'
					case '\n':
						return '\\n'
					case '\r':
						return '\\r'
					case '\b':
						return '\\b'
					case "'":
						return "''"
					default:
						return '\\' + s
					// @formatter:off
				}
			})
			// uglify compliant
			.replace(/\t/g, '\\t')
			.replace(/\x1a/g, '\\Z')

		if (additionalEscape) {
			escaped = escaped.replace(
				new RegExp('[' + additionalEscape + ']', 'g'),
				function (s) {
					return '\\' + s
				}
			)
		}

		return escaped
	},
	escapeRegExp(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
	},
	escapeElementId(str) {
		// Regex based on that suggested by:
		// https://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/
		// - escapes : . [ ] ,
		// - avoids escaping already escaped values
		return str
			? str.replace(/(\\)?([:.\[\],])/g, function ($0, $1, $2) {
					return $1 ? $0 : '\\' + $2
			  })
			: str
	},
	groupSort(items, key) {
		let optgroups = []
		let newItems = []

		items.forEach(function (item) {
			var idx

			if (item[key]) {
				idx = optgroups.lastIndexOf(item[key])

				if (idx == -1) {
					idx = optgroups.length
				} else {
					idx++
				}
			} else {
				idx = optgroups.length
			}

			optgroups.splice(idx, 0, item[key])
			newItems.splice(idx, 0, item)
		})

		return newItems
	},
	defineModelProperties(obj, fields) {
		fields.forEach(function (field) {
			Object.defineProperty(obj.prototype, field, {
				enumerable: true,
				get: function () {
					return this.__[field]
				},
				set: function (value) {
					var previousValue =
						this.__[field] !== null && typeof this.__[field] == 'object'
							? Object.assign({}, this.__[field])
							: this.__[field]

					this.__[field] = value

					if (this.model !== null) {
						/**
						 * After a value of the model changed
						 * @event model:update
						 * @memberof Model
						 * @param {Node} node
						 * @param {string} field
						 * @param {*} value
						 * @param {*} previousValue
						 */
						this.model.trigger('update', this, field, value, previousValue)
					}
				}
			})
		})
	}
}

/**
 * parses the statement configuration
 * @param {*} stmt
 * @returns {Array} null, mode, option
 */
export function getStmtConfig(stmt) {
	let config = stmt.match(/(question_mark|numbered|named)(?:\((.)\))?/)
	if (!config) {
		config = [null, 'question_mark', undefined]
	}
	return config
}

export default Utils
