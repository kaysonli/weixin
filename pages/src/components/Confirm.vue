<template>
  <div class="confirm">
    <modal :show.sync="showModal" effect="fade" width="400">
          <div slot="modal-header" class="modal-header">
            <h4 class="modal-title">
              {{ title }}
            </h4>
          </div>
          <div slot="modal-body" class="modal-body">{{ message }}</div>
          <div slot="modal-footer" class="modal-footer">
            <button type="button" class="btn btn-default" v-touch:tap.stop='onOKHandler'>确定</button>
            <button type="button" class="btn btn-success" v-touch:tap.stop='onCancelHandler'>取消</button>
          </div>
    </modal>
  </div>
</template>

<script>
import modal from '../../node_modules/vue-strap/src/Modal.vue'
export default {
  components: {
    modal
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      showModal: false
    }
  },
  watch: {
    showModal(val) {
      console.log(val);
    }
  },
  methods: {
    show(handler) {
      this.showModal = true;
      this.handler = handler;
    },
    handler(yes) {

    },
    onOKHandler() {
      this.handler(true);
      this.showModal = false;
    },
    onCancelHandler() {
      this.handler(false);
      this.showModal = false;
    }
  }
}
</script>
<style scoped>
  
</style>
