export const setStorage = function(key, obj) {
  let json = JSON.stringify(obj)
  window.localStorage.setItem(key, json)
}

export const getStorage = function(key) {
  const str = window.localStorage.getItem(key)
  if (!str) {
    return null
  }
  return JSON.parse(str)
}

export const clear = function() {
  window.localStorage.clear()
}

export const removeStorage = function(key) {
  window.localStorage.removeItem(key)
}


export const getLang = function() {
  const lang = getStorage('lang') || 'cn'
  return lang === 'cn' ? 'chinese' : 'english'
}
