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
import { getSQL } from './utils/getSQL'
import { getRulesFromSQL } from './utils/getRulesFromSQL'

export default {
	name: 'VueQueryBuilder',

	components: {
		QueryBuilderGroup
	},

	props: {
		rules: Array, // 汇总的查询字段
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
						{ label: '等于', value: 'equal' },
						{ label: '不等于', value: 'not_equal' },
						{ label: '包含于', value: 'in' },
						{ label: '不包含于', value: 'not_in' }
					],
					inputType: 'text',
					id: 'text-field',
					dataType: 'string'
				},
				numeric: {
					operators: [
						{ label: '等于', value: 'equal' },
						{ label: '大于', value: 'greater' },
						{ label: '小于', value: 'less' },
						{ label: '大于等于', value: 'greater_or_equal' },
						{ label: '小于等于', value: 'less_or_equal' },
						{ label: '不等于', value: 'not_equal' }
					],
					inputType: 'number',
					id: 'number-field',
					dataType: 'numeric'
				},
				date: {
					operators: [
						{ label: '等于', value: 'equal' },
						{ label: '大于', value: 'greater' },
						{ label: '小于', value: 'less' },
						{ label: '大于等于', value: 'greater_or_equal' },
						{ label: '小于等于', value: 'less_or_equal' },
						{ label: '不等于', value: 'not_equal' }
					],
					inputType: 'date',
					id: 'date-field',
					dataType: 'date'
				},
				datetime: {
					operators: [
						{ label: '等于', value: 'equal' },
						{ label: '大于', value: 'greater' },
						{ label: '小于', value: 'less' },
						{ label: '大于等于', value: 'greater_or_equal' },
						{ label: '小于等于', value: 'less_or_equal' },
						{ label: '不等于', value: 'not_equal' }
					],
					inputType: 'datetime',
					id: 'datetime-field',
					dataType: 'datetime'
				},
				radio: {
					operators: [
						{ label: '等于', value: 'equal' },
						{ label: '不等于', value: 'not_equal' }
					],
					choices: [],
					inputType: 'radio',
					id: 'radio-field',
					dataType: 'boolean'
				},
				checkbox: {
					operators: [
						{ label: '等于', value: 'equal' },
						{ label: '不等于', value: 'not_equal' },
						{ label: '包含于', value: 'in' },
						{ label: '不包含于', value: 'not_in' }
					],
					choices: [],
					inputType: 'checkbox',
					id: 'checkbox-field',
					dataType: 'array'
				},
				select: {
					operators: [
						{ label: '等于', value: 'equal' },
						{ label: '不等于', value: 'not_equal' }
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
		},
		getSql() {
			let result = getSQL(false, false, deepClone(this.query))
			console.log('sql', result)
			return [this.query, result]
		},
		setSql(sql) {
			if (sql) {
				let result = getRulesFromSQL(sql, false, this.rules)
				console.log('result', result)
				this.query = result
			}
		}
	}
}
</script>

<style>
@import './index.css';
</style>
