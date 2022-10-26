<template>
	<div class="rules-group-container">
		<div class="rules-group-header">
			<div class="btn-group group-conditions">
				<el-radio-group v-model="query.condition" size="mini">
					<el-radio-button label="AND" :disabled="!hasMultipleRule"
						>AND</el-radio-button
					>
					<el-radio-button label="OR" :disabled="!hasMultipleRule"
						>OR</el-radio-button
					>
				</el-radio-group>
			</div>

			<div class="btn-group pull-right group-actions">
				<el-button-group>
					<el-button
						size="mini"
						type="success"
						icon="el-icon-plus"
						@click="addRule"
						>Add Rule</el-button
					>
					<el-button
						v-if="depth < maxDepth"
						size="mini"
						type="success"
						icon="el-icon-circle-plus-outline"
						@click="addGroup"
						>Add Group</el-button
					>
					<el-button
						v-if="depth > 1"
						size="mini"
						type="danger"
						icon="el-icon-close"
						@click="remove"
						>Delete
					</el-button>
				</el-button-group>
			</div>
		</div>
		<div class="rules-group-body">
			<div class="rules-list">
				<!-- 这里的子组件，可能是 query-builder-group，也可能是 query-builder-rule -->
				<component
					:is="child.type"
					v-for="(child, index) in query.rules"
					:key="index"
					:type="child.type"
					:query.sync="child.query"
					:rule-types="ruleTypes"
					:rules="rules"
					:index="index"
					:max-depth="maxDepth"
					:depth="depth + 1"
					@child-deletion-requested="removeChild"
				>
				</component>
			</div>
		</div>
	</div>
</template>

<script>
import QueryBuilderRule from './QueryBuilderRule.vue'
import deepClone from '../utils/deepClone.js'

export default {
	name: 'QueryBuilderGroup',

	components: {
		QueryBuilderRule
	},

	props: [
		'ruleTypes', // 输入控件规则类型
		'type',
		'query', // 查询语句
		'rules', // 查询规则
		'index',
		'maxDepth', // 最大嵌套深度
		'depth'
	],

	data() {
		return {}
	},
	computed: {
		hasMultipleRule() {
			return this.query.rules.length > 1
		}
	},

	methods: {
		addRule() {
			const updated_query = deepClone(this.query)
			const child = {
				type: 'query-builder-rule',
				query: {
					// 真正的规则、条件与值被包裹在 query 字段里
					rule: this.rules[0].id,
					selectedOperator: this.rules[0].operators[0].value,
					value: null
				}
			}
			updated_query.rules.push(child)
			this.$emit('update:query', updated_query)
		},

		addGroup() {
			const updated_query = deepClone(this.query)
			if (this.depth < this.maxDepth) {
				updated_query.rules.push({
					type: 'query-builder-group',
					query: {
						condition: 'AND',
						rules: [
							{
								type: 'query-builder-rule',
								query: {
									rule: this.rules[0].id,
									selectedOperator: this.rules[0].operators[0].value,
									value: null
								}
							}
						]
					}
				})
				this.$emit('update:query', updated_query)
			}
		},

		remove() {
			this.$emit('child-deletion-requested', this.index)
		},

		removeChild(index) {
			const updated_query = deepClone(this.query)
			updated_query.rules.splice(index, 1)
			this.$emit('update:query', updated_query)
		}
	}
}
</script>
