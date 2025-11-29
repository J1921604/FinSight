import React from 'react';

/**
 * Notes Page (Placeholder)
 * Will display XBRL notes analysis with NLP-extracted risk keywords
 * Implementation pending: Phase 7 (US4 - T050-T062)
 */
const NotesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-dark p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-cyan mb-2">注記情報分析</h1>
          <p className="text-text-secondary">XBRL Notes Analysis (Coming Soon)</p>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-bg-card rounded-lg shadow-neuro-lg p-12 border-2 border-primary-cyan border-opacity-30 text-center">
          <div className="text-6xl mb-6">🔬</div>
          <h2 className="text-3xl font-bold text-primary-cyan mb-4">NLP分析機能 開発中</h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            この機能は現在開発中です。完成時には以下の機能を提供します:
          </p>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div className="bg-bg-dark rounded-lg p-6 border border-accent-green border-opacity-20">
              <h3 className="text-xl font-bold text-accent-green mb-3">リスクキーワード抽出</h3>
              <ul className="text-text-secondary text-sm space-y-2">
                <li>• spaCy NLPによる自動抽出</li>
                <li>• 重要度スコアリング (0.0-1.0)</li>
                <li>• 頻出キーワードランキング</li>
                <li>• カテゴリ別分類 (市場/運用/財務)</li>
              </ul>
            </div>

            <div className="bg-bg-dark rounded-lg p-6 border border-primary-magenta border-opacity-20">
              <h3 className="text-xl font-bold text-primary-magenta mb-3">会計方針変更検出</h3>
              <ul className="text-text-secondary text-sm space-y-2">
                <li>• 前期比較による差分検出</li>
                <li>• 変更箇所の自動ハイライト</li>
                <li>• 影響度評価</li>
                <li>• タイムライン表示</li>
              </ul>
            </div>

            <div className="bg-bg-dark rounded-lg p-6 border border-accent-yellow border-opacity-20">
              <h3 className="text-xl font-bold text-accent-yellow mb-3">リスク項目一覧</h3>
              <ul className="text-text-secondary text-sm space-y-2">
                <li>• セクション別リスク分類</li>
                <li>• 深刻度による色分け</li>
                <li>• 元テキスト参照リンク</li>
                <li>• 時系列トレンド分析</li>
              </ul>
            </div>

            <div className="bg-bg-dark rounded-lg p-6 border border-primary-cyan border-opacity-20">
              <h3 className="text-xl font-bold text-primary-cyan mb-3">データソース</h3>
              <ul className="text-text-secondary text-sm space-y-2">
                <li>• EDINET XBRL注記データ</li>
                <li>• 10年間の履歴分析</li>
                <li>• 四半期ごとの更新</li>
                <li>• JSON形式で提供</li>
              </ul>
            </div>
          </div>

          {/* Implementation Status */}
          <div className="mt-12 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-text-primary mb-4">実装予定</h3>
            <div className="bg-bg-dark rounded-lg p-6 border border-primary-cyan border-opacity-20">
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-accent-yellow">⏳</span>
                  <span className="text-text-secondary text-sm">
                    Phase 7: US4実装 (T050-T062)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-accent-yellow">⏳</span>
                  <span className="text-text-secondary text-sm">
                    spaCy日本語モデル統合 (ja_core_news_lg)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-accent-yellow">⏳</span>
                  <span className="text-text-secondary text-sm">
                    NLPパイプライン構築 (backend/scripts/nlp_notes_risk.py)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-accent-yellow">⏳</span>
                  <span className="text-text-secondary text-sm">
                    フロントエンドUI実装 (RiskPanel, PolicyChanges, RiskItem)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Dashboard */}
          <div className="mt-12">
            <a
              href="/"
              className="inline-block bg-primary-cyan text-bg-dark px-8 py-3 rounded-lg font-bold shadow-neuro-md hover:shadow-neuro-lg transition-all"
            >
              ダッシュボードに戻る
            </a>
          </div>
        </div>

        {/* Technical Info */}
        <div className="mt-8 text-center text-text-secondary text-sm">
          <p>このページは Phase 7 (US4: NLP注記分析) で実装されます</p>
          <p className="mt-2">
            技術スタック: Python 3.11 + spaCy 3.7.2 + React 18 + TypeScript
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
