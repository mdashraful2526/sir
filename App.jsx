import React, { useState, useEffect } from 'react';
import { Search, User, LogOut, Plus, Download, ArrowLeft, BookOpen } from 'lucide-react';

// Firebase Configuration (Your provided config)
const firebaseConfig = {
  apiKey: "AIzaSyCy9gJJsEfgoT1CLAtaNiaykrrPSTC9q1g",
  authDomain: "sctop-d22bc.firebaseapp.com",
  projectId: "sctop-d22bc",
  databaseURL: "https://sctop-d22bc-default-rtdb.firebaseio.com",
  storageBucket: "sctop-d22bc.firebasestorage.app",
  messagingSenderId: "733891150436",
  appId: "1:733891150436:web:8ca3a0057030914d8f9571"
};

const App = () => {
  const [page, setPage] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search Form State
  const [searchForm, setSearchForm] = useState({
    name: '',
    roll: '',
    class: '',
    branch: ''
  });

  // Admin Login State
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // New Student Form
  const [newStudent, setNewStudent] = useState({
    name: '',
    roll: '',
    class: '6',
    branch: 'A',
    department: ''
  });

  // Selected Class for Mark Entry
  const [selectedClass, setSelectedClass] = useState('6');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Subjects by Class
  const subjects = {
    '6': ['Bangla', 'English', 'Math', 'Science', 'Social Science', 'Religion'],
    '7': ['Bangla', 'English', 'Math', 'Science', 'Social Science', 'Religion'],
    '8': ['Bangla', 'English', 'Math', 'Science', 'Social Science', 'Religion'],
    '9-Civil': ['Bangla', 'English', 'Math', 'Science', 'Trade 1', 'Trade 2'],
    '9-Computer': ['Bangla', 'English', 'Math', 'Science', 'Computer 1', 'Computer 2'],
    '9-Electrical': ['Bangla', 'English', 'Math', 'Science', 'Electrical 1', 'Electrical 2'],
    '9-Mechanical': ['Bangla', 'English', 'Math', 'Science', 'Mechanical 1', 'Mechanical 2'],
    '10-Civil': ['Bangla', 'English', 'Math', 'Science', 'Trade 1', 'Trade 2'],
    '10-Computer': ['Bangla', 'English', 'Math', 'Science', 'Computer 1', 'Computer 2'],
    '10-Electrical': ['Bangla', 'English', 'Math', 'Science', 'Electrical 1', 'Electrical 2'],
    '10-Mechanical': ['Bangla', 'English', 'Math', 'Science', 'Mechanical 1', 'Mechanical 2']
  };

  const departments = ['Civil', 'Computer', 'Electrical', 'Mechanical'];

  // Initialize Firebase and Load Data
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      const storedStudents = await window.storage.get('students');
      if (storedStudents) {
        setStudents(JSON.parse(storedStudents.value));
      } else {
        // Create demo data
        const demoStudents = generateDemoStudents();
        setStudents(demoStudents);
        await window.storage.set('students', JSON.stringify(demoStudents));
      }
    } catch (error) {
      const demoStudents = generateDemoStudents();
      setStudents(demoStudents);
    }
    setLoading(false);
  };

  const generateDemoStudents = () => {
    const names = ['Rahim Ahmed', 'Karim Hassan', 'Fatima Begum', 'Ayesha Khan', 'Habib Rahman'];
    const demo = [];
    
    for (let cls = 6; cls <= 10; cls++) {
      const branches = ['A', 'B'];
      branches.forEach(branch => {
        for (let i = 1; i <= 3; i++) {
          const student = {
            id: `${cls}-${branch}-${i}`,
            name: `${names[i % names.length]} ${cls}${branch}`,
            roll: i,
            class: cls.toString(),
            branch: branch,
            department: cls >= 9 ? departments[i % departments.length] : '',
            marks: {}
          };
          
          const subjectKey = cls >= 9 ? `${cls}-${student.department}` : cls.toString();
          subjects[subjectKey]?.forEach(subject => {
            student.marks[subject] = Math.floor(Math.random() * 40) + 60;
          });
          
          demo.push(student);
        }
      });
    }
    return demo;
  };

  const saveStudents = async (updatedStudents) => {
    setStudents(updatedStudents);
    try {
      await window.storage.set('students', JSON.stringify(updatedStudents));
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleSearch = () => {
    const result = students.find(s => 
      (searchForm.name && s.name.toLowerCase().includes(searchForm.name.toLowerCase())) ||
      (searchForm.roll && s.roll.toString() === searchForm.roll) ||
      (searchForm.class && searchForm.branch && s.class === searchForm.class && s.branch === searchForm.branch)
    );
    setSearchResult(result || null);
  };

  const handleLogin = () => {
    if (loginForm.username === 'admin' && loginForm.password === 'admin') {
      setIsAdmin(true);
      setPage('admin');
    } else {
      alert('Invalid credentials!');
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.roll) {
      alert('Please fill all required fields!');
      return;
    }

    if ((newStudent.class === '9' || newStudent.class === '10') && !newStudent.department) {
      alert('Please select department for Class 9/10!');
      return;
    }

    const student = {
      id: `${newStudent.class}-${newStudent.branch}-${newStudent.roll}`,
      ...newStudent,
      marks: {}
    };

    const subjectKey = student.class >= '9' ? `${student.class}-${student.department}` : student.class;
    subjects[subjectKey]?.forEach(subject => {
      student.marks[subject] = 0;
    });

    const updated = [...students, student];
    await saveStudents(updated);
    setNewStudent({ name: '', roll: '', class: '6', branch: 'A', department: '' });
    alert('Student added successfully!');
  };

  const handleMarkUpdate = async (studentId, subject, mark) => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        return { ...s, marks: { ...s.marks, [subject]: parseInt(mark) || 0 } };
      }
      return s;
    });
    await saveStudents(updated);
  };

  const getStudentsByClassAndSubject = () => {
    return students.filter(s => {
      if (selectedClass === '9' || selectedClass === '10') {
        return s.class === selectedClass;
      }
      return s.class === selectedClass;
    });
  };

  const getSubjectsForClass = (cls, dept) => {
    if (cls === '9' || cls === '10') {
      return dept ? subjects[`${cls}-${dept}`] || [] : [];
    }
    return subjects[cls] || [];
  };

  const calculateTotal = (marks) => {
    return Object.values(marks).reduce((sum, mark) => sum + (parseInt(mark) || 0), 0);
  };

  const generatePDF = (student) => {
    const subjectKey = student.class >= '9' ? `${student.class}-${student.department}` : student.class;
    const studentSubjects = subjects[subjectKey] || [];
    const total = calculateTotal(student.marks);
    
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4 landscape; margin: 20mm; }
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { color: #1e40af; margin: 5px 0; font-size: 28px; }
    .header h2 { color: #4b5563; margin: 5px 0; font-size: 18px; }
    .info { display: flex; justify-content: space-between; margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px; }
    .info-item { margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 2px solid #2563eb; padding: 12px; text-align: center; }
    th { background: #2563eb; color: white; font-size: 16px; }
    tr:nth-child(even) { background: #eff6ff; }
    .total { font-weight: bold; background: #dbeafe !important; font-size: 18px; }
    .footer { margin-top: 30px; text-align: center; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎓 Dumuria Government Technical School & College</h1>
    <h2>Academic Result Sheet</h2>
  </div>
  
  <div class="info">
    <div>
      <div class="info-item"><strong>Student Name:</strong> ${student.name}</div>
      <div class="info-item"><strong>Roll Number:</strong> ${student.roll}</div>
    </div>
    <div>
      <div class="info-item"><strong>Class:</strong> ${student.class}</div>
      <div class="info-item"><strong>Branch:</strong> ${student.branch}</div>
      ${student.department ? `<div class="info-item"><strong>Department:</strong> ${student.department}</div>` : ''}
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Subject</th>
        <th>Marks Obtained</th>
        <th>Total Marks</th>
      </tr>
    </thead>
    <tbody>
      ${studentSubjects.map(subject => `
        <tr>
          <td>${subject}</td>
          <td>${student.marks[subject] || 0}</td>
          <td>100</td>
        </tr>
      `).join('')}
      <tr class="total">
        <td>TOTAL</td>
        <td>${total}</td>
        <td>${studentSubjects.length * 100}</td>
      </tr>
    </tbody>
  </table>
  
  <div class="footer">
    <p>Generated on ${new Date().toLocaleDateString()}</p>
    <p>This is a computer-generated document</p>
  </div>
</body>
</html>`;

    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Result_${student.name}_${student.class}${student.branch}.html`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-blue-600 font-semibold">Loading...</div>
      </div>
    );
  }

  // HOME PAGE
  if (page === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h1 className="text-4xl font-bold text-center text-blue-900 mb-2">
              🎓 Dumuria Government Technical School & College
            </h1>
            <p className="text-center text-gray-600">Student Result Management System</p>
          </div>

          {/* Admin Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setPage('login')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              <User size={20} /> Admin Login
            </button>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔍 Search Student Result</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Student Name"
                value={searchForm.name}
                onChange={(e) => setSearchForm({...searchForm, name: e.target.value})}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Roll Number"
                value={searchForm.roll}
                onChange={(e) => setSearchForm({...searchForm, roll: e.target.value})}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
              <select
                value={searchForm.class}
                onChange={(e) => setSearchForm({...searchForm, class: e.target.value})}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Class</option>
                {['6','7','8','9','10'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={searchForm.branch}
                onChange={(e) => setSearchForm({...searchForm, branch: e.target.value})}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Branch</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Search size={20} /> Search Result
            </button>

            {searchResult && (
              <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                <h3 className="text-xl font-bold text-green-800 mb-4">✅ Result Found!</h3>
                <div className="bg-white p-4 rounded-lg">
                  <p><strong>Name:</strong> {searchResult.name}</p>
                  <p><strong>Roll:</strong> {searchResult.roll}</p>
                  <p><strong>Class:</strong> {searchResult.class} | <strong>Branch:</strong> {searchResult.branch}</p>
                  {searchResult.department && <p><strong>Department:</strong> {searchResult.department}</p>}
                  <div className="mt-4">
                    <button
                      onClick={() => setSelectedStudent(searchResult)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mr-2"
                    >
                      View Full Result
                    </button>
                    <button
                      onClick={() => generatePDF(searchResult)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 inline-flex"
                    >
                      <Download size={18} /> Download PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* All Students */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 All Students</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {students.slice(0, 20).map(student => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg cursor-pointer transition"
                >
                  <h3 className="font-bold text-lg text-blue-900">{student.name}</h3>
                  <p className="text-gray-600">Roll: {student.roll}</p>
                  <p className="text-gray-600">Class: {student.class} | Branch: {student.branch}</p>
                  {student.department && <p className="text-gray-600 text-sm">{student.department}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-900">Student Result</h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={24} />
                </button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-lg"><strong>Name:</strong> {selectedStudent.name}</p>
                <p><strong>Roll:</strong> {selectedStudent.roll} | <strong>Class:</strong> {selectedStudent.class} | <strong>Branch:</strong> {selectedStudent.branch}</p>
                {selectedStudent.department && <p><strong>Department:</strong> {selectedStudent.department}</p>}
              </div>

              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-gray-300 p-3">Subject</th>
                    <th className="border border-gray-300 p-3">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedStudent.marks).map(([subject, mark]) => (
                    <tr key={subject} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">{subject}</td>
                      <td className="border border-gray-300 p-3 text-center font-semibold">{mark}</td>
                    </tr>
                  ))}
                  <tr className="bg-green-100 font-bold">
                    <td className="border border-gray-300 p-3">TOTAL</td>
                    <td className="border border-gray-300 p-3 text-center">{calculateTotal(selectedStudent.marks)}</td>
                  </tr>
                </tbody>
              </table>

              <button
                onClick={() => generatePDF(selectedStudent)}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download size={20} /> Download Result PDF
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // LOGIN PAGE
  if (page === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">🔐 Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={loginForm.username}
            onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 mb-4 focus:border-blue-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 mb-6 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition mb-4"
          >
            Login
          </button>
          <button
            onClick={() => setPage('home')}
            className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ADMIN PAGE
  if (page === 'admin' && isAdmin) {
    const filteredStudents = getStudentsByClassAndSubject();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-900">👨‍🏫 Admin Panel</h1>
            <button
              onClick={() => { setIsAdmin(false); setPage('home'); }}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>

          {/* Add New Student */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">➕ Add New Student</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <input
                type="text"
                placeholder="Student Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                className="border-2 border-gray-300 rounded-lg px-4 py-2"
              />
              <input
                type="number"
                placeholder="Roll"
                value={newStudent.roll}
                onChange={(e) => setNewStudent({...newStudent, roll: e.target.value})}
                className="border-2 border-gray-300 rounded-lg px-4 py-2"
              />
              <select
                value={newStudent.class}
                onChange={(e) => setNewStudent({...newStudent, class: e.target.value, department: ''})}
                className="border-2 border-gray-300 rounded-lg px-4 py-2"
              >
                {['6','7','8','9','10'].map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <select
                value={newStudent.branch}
                onChange={(e) => setNewStudent({...newStudent, branch: e.target.value})}
                className="border-2 border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="A">Branch A</option>
                <option value="B">Branch B</option>
              </select>
              {(newStudent.class === '9' || newStudent.class === '10') && (
                <select
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                  className="border-2 border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            </div>
            <button
              onClick={handleAddStudent}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Add Student
            </button>
          </div>

          {/* Mark Entry */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Enter Marks by Subject</h2>
            
            {/* Class Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Select Class:</label>
              <div className="flex flex-wrap gap-2">
                {['6','7','8','9','10'].map(cls => (
                  <button
                    key={cls}
                    onClick={() => { setSelectedClass(cls); setSelectedSubject(''); }}
                    className={`px-6 py-3 rounded-lg transition ${
                      selectedClass === cls
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Class {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            {selectedClass && (
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Select Subject:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(selectedClass === '9' || selectedClass === '10') ? (
                    departments.map(dept => {
                      const deptSubjects = subjects[`${selectedClass}-${dept}`] || [];
                      return deptSubjects.map(subject => (
                        <button
                          key={`${dept}-${subject}`}
                          onClick={() => setSelectedSubject(`${dept}-${subject}`)}
                          className={`px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                            selectedSubject === `${dept}-${subject}`
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <BookOpen size={18} /> {subject} ({dept})
                        </button>
                      ));
                    })
                  ) : (
                    (subjects[selectedClass] || []).map(subject => (
                      <button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className={`px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                          selectedSubject === subject
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <BookOpen size={18} /> {subject}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Mark Entry Table */}
            {selectedSubject && (
              <div className="overflow-x-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  📊 Enter Marks for: {selectedSubject.includes('-') ? selectedSubject.split('-')[1] : selectedSubject}
                  {selectedSubject.includes('-') && ` (${selectedSubject.split('-')[0]})`}
                </h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-gray-300 p-3">Student Name</th>
                      <th className="border border-gray-300 p-3">Roll</th>
                      <th className="border border-gray-300 p-3">Branch</th>
                      {selectedSubject.includes('-') && <th className="border border-gray-300 p-3">Department</th>}
                      <th className="border border-gray-300 p-3">Marks (out of 100)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents
                      .filter(s => {
                        if (selectedSubject.includes('-')) {
                          const [dept, subj] = selectedSubject.split('-');
                          return s.department === dept && s.marks.hasOwnProperty(subj);
                        }
                        return s.marks.hasOwnProperty(selectedSubject);
                      })
                      .map(student => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3">{student.name}</td>
                          <td className="border border-gray-300 p-3 text-center">{student.roll}</td>
                          <td className="border border-gray-300 p-3 text-center">{student.branch}</td>
                          {selectedSubject.includes('-') && (
                            <td className="border border-gray-300 p-3 text-center">{student.department}</td>
                          )}
                          <td className="border border-gray-300 p-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={student.marks[selectedSubject.includes('-') ? selectedSubject.split('-')[1] : selectedSubject] || 0}
                              onChange={(e) => handleMarkUpdate(
                                student.id,
                                selectedSubject.includes('-') ? selectedSubject.split('-')[1] : selectedSubject,
                                e.target.value
                              )}
                              className="w-full border-2 border-gray-300 rounded px-3 py-2 text-center focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
