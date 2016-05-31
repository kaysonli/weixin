<template>
	<div class="home">
		<div class="home-nav" @click="viewList">
			<div class="icon-row">
				<i class="fa fa-github-alt"></i>
			</div>
			<div>我的宠管家</div>
		</div>
		<div class="home-nav" @click="addDevice">
			<div class="add-device icon-row">
				<i class="fa fa-plus"></i>
			</div>
			<div class="">新建宠管家</div>
		</div>
		<div class="home-nav">
			<div class="icon-row warning">
				<i class="fa fa-warning"></i>
			</div>
			<div class="warn">报警信息</div>
		</div>
	</div>
</template>

<script>
export default {
	methods: {
		viewList() {
			this.$router.go('/devices');
		},
		addDevice() {
			this.$router.go('/add');
		}
	}
}
</script>
<style>
	.home-nav {
		height: 150px;
		margin: 15px;
		border-radius: 5px;
		background: #fff;
		text-align: center;
	}
	.icon-row {
		height: 100px;
		line-height: 100px;
		font-size: 50px;
	}
	.add-device {
		color: #49E249;
	}
	.warning {
		color: orange;
	}
</style>