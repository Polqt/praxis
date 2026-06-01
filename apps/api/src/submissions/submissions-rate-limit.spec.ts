import * as assert from 'node:assert/strict'

// Pure rate limit logic: given a count of recent submissions and a limit, should the request be blocked?
function isRateLimited(recentCount: number, limitPerHour: number): boolean {
  return recentCount >= limitPerHour
}

// Rolling window: only submissions within the past 1 hour count
function countWithinWindow(submittedAts: Date[], windowMs: number = 60 * 60 * 1000): number {
  const cutoff = new Date(Date.now() - windowMs)
  return submittedAts.filter((d) => d >= cutoff).length
}

const LIMIT = 5

// Test 1: 4 recent submissions → not rate limited, 5th is allowed
assert.equal(isRateLimited(4, LIMIT), false,
  '4 submissions in the hour must not trigger the rate limit')

// Test 2: 5 recent submissions → rate limited, 6th is blocked
assert.equal(isRateLimited(5, LIMIT), true,
  '5 submissions in the hour must trigger the rate limit')

// Test 3: rolling window — submission 61 minutes ago is outside the 1h window
const sixtyOneMinsAgo = new Date(Date.now() - 61 * 60 * 1000)
const recentFour = Array.from({ length: 4 }, (_, i) => new Date(Date.now() - i * 5 * 60 * 1000))
const submittedAts = [sixtyOneMinsAgo, ...recentFour]
const countInWindow = countWithinWindow(submittedAts)
// 61-min-old submission is excluded → only 4 count → not limited
assert.equal(countInWindow, 4,
  'submission older than 1h must be excluded from the rolling window count')
assert.equal(isRateLimited(countInWindow, LIMIT), false,
  'user with 4 in-window submissions (one expired from window) must not be rate limited')

// Test 4: two different users — limits are independent
const userACount = LIMIT      // user A is at the limit
const userBCount = LIMIT - 3  // user B has capacity remaining
assert.equal(isRateLimited(userACount, LIMIT), true,
  'user A at the limit must be blocked')
assert.equal(isRateLimited(userBCount, LIMIT), false,
  'user B under the limit must not be affected by user A')
