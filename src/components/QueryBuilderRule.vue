<template>
	<div class="rule-container">
		<div class="rule-content-container">
			<div class="rule-filter-container">
				<!-- 主规则 -->
				<el-select
					v-model="innerQuery.rule"
					size="small"
					style="width: 120px"
					@change="ruleChange"
				>
					<el-option
						v-for="rule in rules"
						:key="rule.id"
						:label="rule.label"
						:value="rule.id"
					></el-option>
				</el-select>
			</div>
			<!-- 操作符 大于 小于 等于 等等 -->
			<div class="rule-operator-container">
				<el-select
					v-model="innerQuery.operator"
					size="small"
					style="width: 100px"
				>
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
					v-model="innerQuery.value"
					type="text"
					clearable
				/>
				<el-input-number
					v-if="selectedRuleObj.inputType === 'number'"
					v-model="innerQuery.value"
				></el-input-number>
				<el-date-picker
					v-if="
						selectedRuleObj.inputType === 'date' ||
						selectedRuleObj.inputType === 'datetime'
					"
					v-model="innerQuery.value"
					value-format="timestamp"
					:editable="false"
					:type="selectedRuleObj.inputType"
				/>
				<el-checkbox-group
					v-if="selectedRuleObj.inputType === 'checkbox'"
					v-model="innerQuery.value"
				>
					<el-checkbox
						v-for="choice in selectedRuleObj.choices"
						:key="choice"
						:label="choice"
					>
						{{ choice }}
					</el-checkbox>
				</el-checkbox-group>
				<el-radio-group
					v-if="selectedRuleObj.inputType === 'radio'"
					v-model="innerQuery.value"
				>
					<el-radio
						v-for="choice in selectedRuleObj.choices"
						:key="choice"
						:label="choice"
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
// import _ from 'lodash'

export default {
	name: 'QueryBuilderRule',

	props: [
		'query',
		'index',
		'rules' // rules 是从系统顶部传入的总 rules
	],

	data() {
		return {
			innerQuery: {
				dataType: null,
				operator: '',
				rule: '', // 查询字段
				value: null
			},
			// 选中的、当前操作符规则对象
			selectedRuleObj: this.rules[0]
		}
	},

	watch: {
		// query(val, oldVal) {
		// 	if (val.rule === 'radio') {
		// 		console.log('query', val, oldVal)
		// 	}
		// }
		'innerQuery.value'() {
			this.$emit('update:query', this.innerQuery)
		}
	},
	mounted() {
		// Set a default value for these types if one isn't provided already
		// 初始化
		this.initValue()
		this.initOperatorSelector()
	},
	methods: {
		initOperatorSelector() {
			this.selectedRuleObj = this.rules.filter(
				rule => rule.id === this.innerQuery.rule
			)[0]
		},
		remove() {
			this.$emit('child-deletion-requested', this.index)
		},
		// 主规则变化
		// 查询字段发生变化
		ruleChange(rule) {
			// console.log('changedRule', rule)
			// 更新查询字段
			this.innerQuery.rule = rule

			// console.log('innerQuery', this.innerQuery)

			// 更新查询字段对应默认值
			this.innerQuery.value = null
			if (this.innerQuery.rule === 'checkbox') {
				this.innerQuery.value = []
			}

			this.initOperatorSelector()

			// 更新查询操作符
			this.innerQuery.operator = this.selectedRuleObj.operators[0].value

			this.$emit('update:query', this.innerQuery)

			this.initValue()
		},
		setInnerQuery(source) {
			this.innerQuery.dataType = source.dataType
			this.innerQuery.rule = source.rule
			this.innerQuery.operator = source.operator
			this.innerQuery.value = source.value
		},
		initValue() {
			// this.query.dataType = this.selectedRuleObj.dataType
			const clone = deepClone(this.query)
			this.setInnerQuery(clone)
			// clone.dataType = this.selectedRuleObj.dataType
			// this.$emit('update:query', clone)
			if (this.query.value === null) {
				// const updated_query = deepClone(this.query)
				if (this.selectedRuleObj.inputType === 'checkbox') {
					this.innerQuery.value = []
				}
				if (
					this.selectedRuleObj.inputType === 'select' ||
					this.selectedRuleObj.inputType === 'radio'
				) {
					this.innerQuery.value = this.selectedRuleObj.choices[0]
				}
				if (
					this.selectedRuleObj.inputType === 'time' ||
					this.selectedRuleObj.inputType === 'date' ||
					this.selectedRuleObj.inputType === 'datetime'
				) {
					this.innerQuery.value = Math.round(new Date())
				}
				this.$emit('update:query', this.innerQuery)
			}
		}
	}
}
</script>
