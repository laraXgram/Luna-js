<script setup lang="ts">
import { Form } from '@lunajs/vue3'
</script>

<template>
  <Form action="/non-luna/download" method="get">
    <input type="text" name="search" id="search" value="test-query" />

    <button type="submit" formtarget="_blank" name="format" value="csv" id="button-blank">
      Button with formTarget blank
    </button>
    <input type="submit" formtarget="_blank" name="type" value="export" id="input-blank" />
  </Form>
</template>
