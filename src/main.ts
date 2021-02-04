import * as core from '@actions/core'
import bytes from 'bytes'
import fs from 'fs'
import glob from 'glob'
import fetch from 'node-fetch'

async function getSize(file: string): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      const stat = fs.statSync(file)
      resolve(stat.size)
    } catch (error) {
      reject(error)
    }
  })
}

async function run(): Promise<void> {
  try {
    const pattern: string = core.getInput('patterns')
    const threshold: string = core.getInput('threshold')
    const thresholdInBytes = bytes(threshold)
    const incomingWebhookUrl = process.env.INCOMING_WEBHOOK_URL

    core.debug(new Date().toTimeString())

    const files = await glob.sync(pattern)
      .reduce(async (promise, file): Promise<[string, number][]> => {
        const prev = await promise
        const size = await getSize(file)
        return [...prev, [file, size]]
      }, Promise.resolve<[string, number][]>([]))

    const found = files.filter(([/** file */, size]) => size > thresholdInBytes)

    if (typeof incomingWebhookUrl !== 'undefined' && found.length > 0) {
      const message = {

      }

      const res = await fetch(incomingWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(message)
      })
    }

    if (found.length > 0) {
      core.setFailed('')
    }

    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
