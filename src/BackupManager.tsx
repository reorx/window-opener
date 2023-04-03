import { useSettingsStore } from './store';
import { setActionBehavior } from './utils/action';


export const BackupManager = () => {

  const [settings, setSettings] = useSettingsStore();

  const exportSettings = () => {
    // get datetime in format YYYYMMDD
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    downloadContent(`window-opener-settings-export-${dateStr}.json`, JSON.stringify(settings, null, 2))
  }

  const importSettings = () => {
    // get content from file input: input[name="import-file"]
    const elFile: HTMLInputElement = document.querySelector('input[name="import-file"]')!
    if (!elFile.files || elFile.files.length === 0) {
      alert('Import error: no file chosen')
      return
    }
    readInputFile(elFile.files[0], (data) => {
      setSettings(data)
      setActionBehavior(data.iconAction)
      alert('Import settings success.')
    })
  }

  return (
    <div>
      <div>
        <button
          onClick={exportSettings}
        >Export</button>
      </div>

      <div>
        <input type="file" name="import-file" accept=".json" />
        <button
          onClick={importSettings}
        >Import</button>
      </div>
    </div>
  )
}

function readInputFile(file: File, onDataParsed: (data: any) => void) {
  const reader = new FileReader()
  reader.onload = (e) => {
    let data
    data = JSON.parse(e.target!.result as string)
    onDataParsed(data)
  }
  reader.readAsText(file)
}

function downloadContent(filename: string, text: string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
