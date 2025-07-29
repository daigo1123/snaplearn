export const translations = {
  ja: {
    // Header
    appName: 'CaptureLearn',
    upload: 'アップロード',
    myCards: 'マイカード',
    study: '学習',

    // Upload
    uploadImage: '画像をアップロード',
    dropImageHere: '画像をここにドロップするか、クリックして選択',
    supportedFormats: 'サポート形式: JPG, PNG, WebP',
    processing: '処理中...',
    generateCards: 'カードを生成',

    // Cards
    addedOn: '追加日',
    correctAnswers: '正解数',
    wrongAnswers: '不正解数',
    accuracy: '正解率',
    deleteCard: 'カードを削除',
    editCard: 'カードを編集',
    noCardsYet: 'まだカードがありません',
    addFirstCard: '最初のカードを追加しましょう',

    // Study Mode
    progress: '進捗',
    showAnswer: '答えを表示',
    didntKnow: '知らなかった',
    knewIt: '知ってた！',
    greatJob: 'お疲れ様！',
    sessionComplete: '学習セッションが完了しました。',
    studyAgain: 'もう一度学習',
    addCardsToStudy: '学習するためにカードを追加してください！',

    // Common
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',

    // Footer
    footerText: 'CaptureLearn - © 2024. 写真から瞬時にフラッシュカードを作成。'
  },
  en: {
    // Header
    appName: 'CaptureLearn',
    upload: 'Upload',
    myCards: 'My Cards',
    study: 'Study',

    // Upload
    uploadImage: 'Upload Image',
    dropImageHere: 'Drop an image here or click to select',
    supportedFormats: 'Supported formats: JPG, PNG, WebP',
    processing: 'Processing...',
    generateCards: 'Generate Cards',

    // Cards
    addedOn: 'Added on',
    correctAnswers: 'Correct',
    wrongAnswers: 'Wrong',
    accuracy: 'Accuracy',
    deleteCard: 'Delete Card',
    editCard: 'Edit Card',
    noCardsYet: 'No cards yet',
    addFirstCard: 'Let\'s add your first card',

    // Study Mode
    progress: 'Progress',
    showAnswer: 'Show Answer',
    didntKnow: 'Didn\'t Know',
    knewIt: 'Knew It!',
    greatJob: 'Great job!',
    sessionComplete: 'You\'ve completed this study session.',
    studyAgain: 'Study Again',
    addCardsToStudy: 'Add some cards to start studying!',

    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',

    // Footer
    footerText: 'CaptureLearn - © 2024. Create flashcards instantly from your photos.'
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;