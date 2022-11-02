<template>
	<div class="binary-input-container">
		<el-input v-model="start" @input="handleStartInput"></el-input>,&nbsp;
		<el-input v-model="end" @input="handleEndInput"></el-input>
	</div>
</template>

<script>
export default {
	name: 'BetweenAndValue',
	props: {
		value: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			start: null,
			end: null
		}
	},
	mounted() {
		this.start = this.value[0]
		this.end = this.value[1]
	},
	methods: {
		handleStartInput(start) {
			console.log('start', start)
			this.$emit('update:value', [start, this.end])
		},
		handleEndInput(end) {
			console.log('end', end)
			this.$emit('update:value', [this.start, end])
		}
	}
}
</script>

<style></style>
