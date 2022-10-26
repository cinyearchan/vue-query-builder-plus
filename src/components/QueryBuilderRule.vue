<template>
	<div class="rule-container">
		<div class="rule-content-container">
			<div class="rule-filter-container">
				<!-- 主规则 -->
				<el-select v-model="selectedRule" size="small" @change="ruleChange">
					<el-option
						v-for="r in rules"
						:key="r.id"
						:label="r.label"
						:value="r.id"
					></el-option>
				</el-select>
				<!-- 副规则 -->
				<el-select
					v-if="subRules !== null && subRules.length > 0"
					v-model="selectedSubRule"
					size="small"
					@change="subRuleChange"
				>
					<el-option
						v-for="r in subRules"
						:key="r.id"
						:label="r.label"
						:value="r.id"
					></el-option>
				</el-select>
			</div>
			<!-- 操作符 大于 小于 等于 等等 -->
			<div class="rule-operator-container">
				<el-select v-model="query.selectedOperator" size="small">
					<el-option
						v-for="operator in selectedRuleObj.operators"
						:key="operator.value"
						:value="operator.value"
						:label="operator.label"
					>
					</el-option>
				</el-select>
			</div>
			<!-- 规则值 -->
			<div class="rule-value-container">
				<el-input
					v-if="selectedRuleObj.inputType === 'text'"
					v-model="query.value"
					type="text"
					clearable
				/>
				<el-input-number
					v-if="selectedRuleObj.inputType === 'number'"
					v-model="query.value"
				></el-input-number>
				<el-date-picker
					v-if="
						selectedRuleObj.inputType === 'date' ||
						selectedRuleObj.inputType === 'datetime'
					"
					v-model="query.value"
					value-format="timestamp"
					:editable="false"
					:type="selectedRuleObj.inputType"
				/>
				<el-checkbox-group
					v-if="selectedRuleObj.inputType === 'checkbox'"
					v-model="query.value"
				>
					<el-checkbox
						v-for="choice in selectedRuleObj.choices"
						:key="choice"
						:label="choice"
						:value="choice"
					>
					</el-checkbox>
				</el-checkbox-group>
				<el-radio-group
					v-if="selectedRuleObj.inputType === 'radio'"
					v-model="query.value"
				>
					<el-radio
						v-for="choice in selectedRuleObj.choices"
						:key="choice"
						:label="choice"
						:value="choice"
					>
					</el-radio>
				</el-radio-group>
			</div>
		</div>
		<!-- 删除按钮 -->
		<div class="rule-header">
			<div class="btn-group pull-right rule-actions">
				<el-button
					size="small"
					type="danger"
					icon="el-icon-close"
					@click="remove"
					>Delete</el-button
				>
			</div>
		</div>
	</div>
</template>

<script>
import deepClone from '../utils/deepClone.js'

export default {
	name: 'QueryBuilderRule',

	props: ['query', 'index', 'rules'],

	data() {
		return {
			selectedRuleObj: this.rules[0],
			selectedRule: this.query.rule || this.rules[0].id,
			selectedSubRule: null,
			subRules: []
		}
	},

	mounted() {
		// Set a default value for these types if one isn't provided already
		this.initValue()

		var _this = this
		var selectedRuleCopy = _this.selectedRule
		var splitIndex = selectedRuleCopy.indexOf('-')
		if (splitIndex > -1) {
			_this.selectedRule = selectedRuleCopy.substring(0, splitIndex)
			_this.selectedSubRule = selectedRuleCopy.substring(splitIndex + 1)
			this.rules.forEach(function (rule) {
				if (rule.id === _this.selectedRule) {
					var isBreak = false
					_this.subRules = rule.subRules
					rule.subRules.forEach(function (subRule) {
						if (subRule.id === _this.selectedSubRule) {
							_this.selectedRuleObj = subRule
							isBreak = true
							return false
						}
					})
					if (isBreak) {
						return false
					}
				}
			})
		} else {
			this.rules.forEach(function (rule) {
				if (rule.id === _this.selectedRule) {
					_this.selectedRuleObj = rule
					return false
				}
			})
		}
	},
	methods: {
		remove: function () {
			this.$emit('child-deletion-requested', this.index)
		},
		ruleChange: function () {
			const _this = this
			this.query.value = null
			this.subRules = []
			this.selectedSubRule = null
			this.rules.forEach(function (value) {
				if (value.id === _this.selectedRule) {
					if (
						value.subRules !== undefined &&
						value.subRules !== null &&
						value.subRules.length > 0
					) {
						_this.subRules = value.subRules
					} else {
						_this.selectedRuleObj = value
						_this.query.rule = _this.selectedRule
						_this.initValue()
					}
				}
			})
			this.query.selectedOperator = this.selectedRuleObj.operators[0].value
		},
		subRuleChange: function () {
			const _this = this
			this.query.value = null
			this.subRules.forEach(function (value) {
				if (value.id === _this.selectedSubRule) {
					_this.selectedRuleObj = value
					_this.query.selectedOperator =
						_this.selectedRuleObj.operators[0].value
					_this.query.rule = _this.selectedRule + '-' + _this.selectedSubRule
					_this.initValue()
				}
			})
		},
		initValue() {
			this.query.dateType = this.selectedRuleObj.dateType
			if (this.query.value === null) {
				const updated_query = deepClone(this.query)
				if (this.selectedRuleObj.inputType === 'checkbox') {
					updated_query.value = []
				}
				if (
					this.selectedRuleObj.inputType === 'select' ||
					this.selectedRuleObj.inputType === 'radio'
				) {
					updated_query.value = this.selectedRuleObj.choices[0]
				}
				if (
					this.selectedRuleObj.inputType === 'time' ||
					this.selectedRuleObj.inputType === 'date' ||
					this.selectedRuleObj.inputType === 'datetime'
				) {
					updated_query.value = Math.round(new Date())
				}
				this.$emit('update:query', deepClone(updated_query))
			}
		}
	}
}
</script>
