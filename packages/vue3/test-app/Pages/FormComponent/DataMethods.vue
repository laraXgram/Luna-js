<script setup lang="ts">
import { FormDataConvertible } from '@laraxgram/luna'
import { Form } from '@laraxgram/vue3'

function testGetData(getData: () => Record<string, FormDataConvertible>) {
  const data = getData()
  console.log('getData result: ' + JSON.stringify(data))
}

function testGetFormData(getFormData: () => FormData) {
  const formData = getFormData()
  console.log('getFormData entries: ' + JSON.stringify(Object.fromEntries(formData.entries())))
}
</script>

<template>
  <div>
    <h1>Test getData() and getFormData() Methods</h1>

    <Form v-slot="{ getData, getFormData }">
      <input id="name" type="text" name="name" />

      <button type="button" @click="testGetData(getData)">Test getData()</button>

      <button type="button" @click="testGetFormData(getFormData)">Test getFormData()</button>
    </Form>
  </div>
</template>
