<template>
	<div class="query-builder form-inline" style="padding: 0 50px">
		<query-builder-group
			:index="0"
			:query.sync="query"
			:rule-types="ruleTypes"
			:rules="mergedRules"
			:max-depth="maxDepth"
			:depth="depth"
			type="query-builder-group"
		></query-builder-group>
	</div>
</template>

<script>
import QueryBuilderGroup from './components/QueryBuilderGroup.vue'
import deepClone from './utils/deepClone.js'

export default {
	name: 'VueQueryBuilder',

	components: {
		QueryBuilderGroup
	},

	props: {
		rules: Array,
		maxDepth: {
			type: Number,
			default: 3,
			validator: function (value) {
				return value >= 1
			}
		},
		value: Object
	},

	data() {
		return {
			depth: 1,
			query: {
				condition: 'AND',
				rules: []
			},
			ruleTypes: {
				text: {
					operators: [
						{ label: '等于', value: 'EQUALS' },
						{ label: '不等于', value: 'NOTEQUALS' },
						{ label: '包含于', value: 'IN' },
						{ label: '不包含于', value: 'NOTIN' }
					],
					inputType: 'text',
					id: 'text-field',
					dataType: 'string'
				},
				numeric: {
					operators: [
						{ label: '等于', value: 'EQUALS' },
						{ label: '大于', value: 'GREATTHAN' },
						{ label: '小于', value: 'LESSTHAN' },
						{ label: '大于等于', value: 'GREATTHANEQUALS' },
						{ label: '小于等于', value: 'LESSTHANEQUALS' },
						{ label: '不等于', value: 'NOTEQUALS' }
					],
					inputType: 'number',
					id: 'number-field',
					dataType: 'numeric'
				},
				date: {
					operators: [
						{ label: '等于', value: 'EQUALS' },
						{ label: '大于', value: 'GREATTHAN' },
						{ label: '小于', value: 'LESSTHAN' },
						{ label: '大于等于', value: 'GREATTHANEQUALS' },
						{ label: '小于等于', value: 'LESSTHANEQUALS' },
						{ label: '不等于', value: 'NOTEQUALS' }
					],
					inputType: 'date',
					id: 'date-field',
					dataType: 'date'
				},
				datetime: {
					operators: [
						{ label: '等于', value: 'EQUALS' },
						{ label: '大于', value: 'GREATTHAN' },
						{ label: '小于', value: 'LESSTHAN' },
						{ label: '大于等于', value: 'GREATTHANEQUALS' },
						{ label: '小于等于', value: 'LESSTHANEQUALS' },
						{ label: '不等于', value: 'NOTEQUALS' }
					],
					inputType: 'datetime',
					id: 'datetime-field',
					dataType: 'datetime'
				},
				radio: {
					operators: [
						{ label: '等于', value: 'EQUALS' },
						{ label: '不等于', value: 'NOTEQUALS' }
					],
					choices: [],
					inputType: 'radio',
					id: 'radio-field',
					dataType: 'boolean'
				},
				checkbox: {
					operators: [
						{ label: '等于', value: 'EQUALS' },
						{ label: '不等于', value: 'NOTEQUALS' },
						{ label: '包含于', value: 'IN' },
						{ label: '不包含于', value: 'NOTIN' }
					],
					choices: [],
					inputType: 'checkbox',
					id: 'checkbox-field',
					dataType: 'array'
				},
				select: {
					operators: [
						{ label: '等于', value: 'EQUALS' },
						{ label: '不等于', value: 'NOTEQUALS' }
					],
					choices: [],
					inputType: 'select',
					id: 'select-field',
					dataType: 'object'
				}
			}
		}
	},

	computed: {
		mergedRules() {
			var mergedRules = []
			var vm = this

			vm.rules.forEach(function (rule) {
				if (rule.subRules !== undefined) {
					var mergedSubRules = []
					rule.subRules.forEach(function (subRule) {
						if (typeof vm.ruleTypes[subRule.type] !== 'undefined') {
							mergedSubRules.push(
								Object.assign({}, vm.ruleTypes[subRule.type], subRule)
							)
						} else {
							mergedSubRules.push(subRule)
						}
					})
					rule.subRules = mergedSubRules
				}
				if (typeof vm.ruleTypes[rule.type] !== 'undefined') {
					mergedRules.push(Object.assign({}, vm.ruleTypes[rule.type], rule))
				} else {
					mergedRules.push(rule)
				}
			})

			return mergedRules
		}
	},

	mounted() {
		this.$watch(
			'query',
			newQuery => {
				this.$emit('input', deepClone(newQuery))
			},
			{
				deep: true
			}
		)

		if (typeof this.$options.propsData.value !== 'undefined') {
			this.query = Object.assign(this.query, this.$options.propsData.value)
		}
	},

	methods: {
		reset() {
			this.query.condition = 'AND'
			this.query.rules = []
		},
		getResult() {
			console.log('query', this.query)
		}
	}
}
</script>

<style>
@import './index.css';
</style>
