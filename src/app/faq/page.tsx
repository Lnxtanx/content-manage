"use client";
import { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface FAQ {
  id: number;
  question: string;
  answer: string | null;
  created_at: string;
  answered_at: string | null;
  // We'll determine status based on answer field
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch FAQs
  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/faq');
      if (!res.ok) throw new Error('Failed to fetch FAQs');
      const data = await res.json();
      setFaqs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  // Submit new question
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion })
      });

      if (!res.ok) throw new Error('Failed to submit question');
      
      // Refresh FAQs list
      fetchFAQs();
      setNewQuestion('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit answer to a question
  const handleSubmitAnswer = async (id: number) => {
    if (!answerText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/faq/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answerText })
      });

      if (!res.ok) throw new Error('Failed to submit answer');
      
      // Refresh FAQs list
      fetchFAQs();
      setAnswerText('');
      setExpandedId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle FAQ item expansion
  const toggleFAQ = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  // Group FAQs by answer status
  const pendingFAQs = faqs.filter(faq => !faq.answer);
  const answeredFAQs = faqs.filter(faq => faq.answer);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Frequently Asked Questions</h1>
      
      {/* Question submission form */}
      <form className={styles.form} onSubmit={handleSubmitQuestion}>
        <h2 className={styles.formTitle}>Ask a Question</h2>
        <div className={styles.formGroup}>
          <label htmlFor="question" className={styles.label}>Your Question</label>
          <textarea
            id="question"
            className={styles.textarea}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Type your question here..."
            required
          />
        </div>
        <button 
          type="submit" 
          className={styles.submitBtn} 
          disabled={submitting || !newQuestion.trim()}
        >
          {submitting ? 'Submitting...' : 'Submit Question'}
        </button>
      </form>
      
      {error && <div className={styles.error}>{error}</div>}
      
      {loading ? (
        <div className={styles.loading}>Loading FAQs...</div>
      ) : (
        <>
          {/* Answered FAQs Section */}
          <section className={styles.faqSection}>
            <h2 className={styles.sectionTitle}>Answered Questions</h2>
            {answeredFAQs.length > 0 ? (
              <div className={styles.faqList}>
                {answeredFAQs.map(faq => (
                  <div 
                    key={faq.id} 
                    className={`${styles.faqItem} ${expandedId === faq.id ? styles.expanded : ''}`}
                  >
                    <div className={styles.faqHeader} onClick={() => toggleFAQ(faq.id)}>
                      <h3 className={styles.question}>{faq.question}</h3>
                      <span className={styles.toggleIcon}>▼</span>
                    </div>
                    <div className={styles.faqContent}>
                      <p className={styles.answer}>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noData}>No answered questions yet.</div>
            )}
          </section>

          {/* Pending FAQs Section - Admin Only */}
          <section className={styles.faqSection}>
            <h2 className={styles.sectionTitle}>Pending Questions (Admin)</h2>
            {pendingFAQs.length > 0 ? (
              <div className={styles.faqList}>
                {pendingFAQs.map(faq => (
                  <div 
                    key={faq.id} 
                    className={`${styles.faqItem} ${expandedId === faq.id ? styles.expanded : ''}`}
                  >
                    <div className={styles.faqHeader} onClick={() => toggleFAQ(faq.id)}>
                      <h3 className={styles.question}>{faq.question}</h3>
                      <span className={styles.toggleIcon}>▼</span>
                    </div>
                    <div className={styles.faqContent}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Answer this question:</label>
                        <textarea
                          className={styles.textarea}
                          value={expandedId === faq.id ? answerText : ''}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Type your answer here..."
                        />
                      </div>
                      <button 
                        className={styles.submitBtn}
                        onClick={() => handleSubmitAnswer(faq.id)}
                        disabled={submitting || !answerText.trim()}
                      >
                        {submitting ? 'Submitting...' : 'Submit Answer'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noData}>No pending questions.</div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
