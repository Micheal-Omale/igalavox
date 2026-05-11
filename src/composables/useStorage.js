import { ref } from 'vue'
import { supabase } from '../services/supabase'

export function useStorage() {
  const loading = ref(false)
  const error = ref(null)

  const uploadAudio = async (file, fileName) => {
    loading.value = true
    error.value = null
    const filePath = `${Date.now()}_${fileName}`
    const { data, error: err } = await supabase.storage.from('audio').upload(filePath, file)
    
    if (err) {
      error.value = err
      loading.value = false
      return { data: null, err }
    }

    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(data.path)
    
    const { data: audioRecord, error: dbErr } = await supabase.from('audio_files').insert({
      file_url: publicUrlData.publicUrl,
      file_name: fileName
    }).select().single()

    loading.value = false
    return { data: audioRecord, err: dbErr }
  }

  return { uploadAudio, loading, error }
}
