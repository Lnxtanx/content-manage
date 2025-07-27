'use client';

import { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface School {
  id: number;
  name: string;
}

interface LessonReport {
  id: number;
  lessonName: string;
  lessonoutcomes: string | null;
  lessonobjectives: string | null;
  status: 'completed' | 'incomplete';
  completedBy: string | null;
  completedAt: string | null;
  Class: {
    name: string;
  };
}

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [lessonReport, setLessonReport] = useState<LessonReport[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  const downloadReport = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('completion-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedSchool) {
      fetchLessonReport();
    }
  }, [selectedSchool]);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/school-completion-report');
      const data = await response.json();
      setSchools(data.schools);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schools:', error);
      setLoading(false);
    }
  };

  const fetchLessonReport = async () => {
    if (!selectedSchool) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/school-completion-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schoolId: selectedSchool }),
      });
      const data = await response.json();
      setLessonReport(data.lessonReport);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lesson report:', error);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>School Class Completion Report</h1>
      
      <div className={styles.schoolSelector}>
        <select 
          value={selectedSchool || ''} 
          onChange={(e) => setSelectedSchool(e.target.value ? parseInt(e.target.value) : null)}
          className={styles.select}
        >
          <option value="">Select a school</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading report data...</div>
      ) : selectedSchool ? (
        <div className={styles.reportContainer} ref={reportRef}>
          <div className={styles.reportHeader}>
            <h2>Lesson Completion Report</h2>
            <button onClick={downloadReport} className={styles.downloadButton}>
              Download Report
            </button>
          </div>
          
          {lessonReport.length > 0 ? (
            <div className={styles.lessonList}>
              <div className={styles.listHeader}>
                <div className={styles.columnLesson}>Lesson Name</div>
                <div className={styles.columnClass}>Class</div>
                <div className={styles.columnDetails}>Outcomes & Objectives</div>
                <div className={styles.columnStatus}>Status</div>
                <div className={styles.columnCompletion}>Completion Details</div>
              </div>
              
              {lessonReport.map((lesson) => (
                <div key={lesson.id} className={styles.lessonRow}>
                  <div className={styles.columnLesson}>{lesson.lessonName}</div>
                  <div className={styles.columnClass}>{lesson.Class.name}</div>
                  <div className={styles.columnDetails}>
                    {lesson.lessonoutcomes && (
                      <div className={styles.detailItem}>
                        <strong>Outcomes:</strong> {lesson.lessonoutcomes}
                      </div>
                    )}
                    {lesson.lessonobjectives && (
                      <div className={styles.detailItem}>
                        <strong>Objectives:</strong> {lesson.lessonobjectives}
                      </div>
                    )}
                  </div>
                  <div className={styles.columnStatus}>
                    <span className={`${styles.status} ${styles[lesson.status]}`}>
                      {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
                    </span>
                  </div>
                  <div className={styles.columnCompletion}>
                    {lesson.status === 'completed' ? (
                      <>
                        <div>By: {lesson.completedBy}</div>
                        <div>Date: {new Date(lesson.completedAt!).toLocaleDateString()}</div>
                      </>
                    ) : (
                      <span className={styles.pendingText}>Not completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noData}>
              No lessons found for this school.
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noSchool}>
          Please select a school to view the completion report.
        </div>
      )}
    </div>
  );
}
