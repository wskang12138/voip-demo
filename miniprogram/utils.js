const promisify = (fn, options) => {
  return new Promise((reslove, reject) => {
    fn({
      ...options,
      success(resp) {
        reslove(resp)
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

const State = {
  PENDING: 0,
  RESOLVE: 1,
  REJECT: 2,
}

class AsyncValue {
  constructor() {
    this.value = undefined
    this.state = State.PENDING
    // 复用同一个 Promise，减少不必要的对象开销
    this.pendingRequest = null
    this.resolvePending = null
    this.rejectPending = null
  }

  async get() {
    if (this.state === State.RESOLVE) {
      return this.value
    } else if (this.state === State.REJECT) {
      return Promise.reject(this.value)
    } else {
      if (!this.pendingRequest) {
        this.pendingRequest = new Promise((resolve, reject) => {
          this.resolvePending = resolve
          this.rejectPending = reject
        })
      }
      return this.pendingRequest
    }
  }
  getSync() {
    if (this.state === State.PENDING) {
      return undefined
    } else {
      return this.value
    }
  }
  set(val, isError = false) {
    if (this.state !== State.PENDING) {
      throw new Error('forbidden: set value more than once')
    } else {
      this.value = val
      if (!isError) {
        this.state = State.RESOLVE
        if (this.resolvePending) this.resolvePending(this.value)
      } else {
        this.state = State.REJECT
        if (this.rejectPending) this.rejectPending(this.value)
      }
      // clean up
      this.resolvePending = null
      this.rejectPending = null
      this.pendingRequest = null
    }
  }
  isPending() {
    return this.state === State.PENDING
  }
  isResolved() {
    return this.state === State.RESOLVE
  }
  isRejected() {
    return this.state === State.REJECT
  }
}

export { promisify, AsyncValue }
