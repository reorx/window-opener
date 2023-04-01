import { IconAction } from '../store';


export function setActionBehavior(action: IconAction) {
  if (action === IconAction.defaultWindow) {
    chrome.action.setPopup({
      popup: ''
    })
  } else if (action === IconAction.windowList) {
    console.log('set popup to popup.html')
    chrome.action.setPopup({
      popup: 'popup.html'
    })
  }
}

export function openOptionsPage() {
  chrome.tabs.create({
    url: 'options.html'
  })
}
