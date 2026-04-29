"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const API_URL = 'http://localhost:5000/api';
// Общие настройки для всех запросов
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};
// Обработка ошибок
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка сервера');
    }
    return response.json();
};
// API методы
exports.api = {
    // Аутентификация
    login: (email, password) => {
        return fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, password })
        }).then(handleResponse);
    },
    getProfile: () => {
        return fetch(`${API_URL}/auth/profile`, {
            headers: getHeaders()
        }).then(handleResponse);
    },
    // Учителя
    getTeachers: () => {
        return fetch(`${API_URL}/teachers`, {
            headers: getHeaders()
        }).then(handleResponse);
    },
    createTeacher: (data) => {
        return fetch(`${API_URL}/teachers`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse);
    },
    updateTeacher: (id, data) => {
        return fetch(`${API_URL}/teachers/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse);
    },
    deleteTeacher: (id) => {
        return fetch(`${API_URL}/teachers/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        }).then(handleResponse);
    },
    // Предметы
    getSubjects: () => {
        return fetch(`${API_URL}/subjects`, {
            headers: getHeaders()
        }).then(handleResponse);
    },
    createSubject: (data) => {
        return fetch(`${API_URL}/subjects`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse);
    },
    updateSubject: (id, data) => {
        return fetch(`${API_URL}/subjects/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse);
    },
    deleteSubject: (id) => {
        return fetch(`${API_URL}/subjects/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        }).then(handleResponse);
    },
    // Классы
    getClasses: () => {
        return fetch(`${API_URL}/classes`, {
            headers: getHeaders()
        }).then(handleResponse);
    },
    // Расписание
    getSchedule: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.classId)
            queryParams.append('classId', params.classId.toString());
        if (params?.teacherId)
            queryParams.append('teacherId', params.teacherId.toString());
        if (params?.dayOfWeek)
            queryParams.append('dayOfWeek', params.dayOfWeek.toString());
        const url = `${API_URL}/schedule${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return fetch(url, {
            headers: getHeaders()
        }).then(handleResponse);
    },
    createLessons: (lessons) => {
        return fetch(`${API_URL}/schedule/lessons`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(lessons)
        }).then(handleResponse);
    },
    deleteLesson: (id) => {
        return fetch(`${API_URL}/schedule/lessons/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        }).then(handleResponse);
    },
    // Отчеты
    getReports: () => {
        return fetch(`${API_URL}/reports`, {
            headers: getHeaders()
        }).then(handleResponse);
    },
    createReport: (data) => {
        return fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse);
    },
    updateReportStatus: (id, status, adminResponse) => {
        return fetch(`${API_URL}/reports/${id}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status, adminResponse })
        }).then(handleResponse);
    }
};
//# sourceMappingURL=api.js.map