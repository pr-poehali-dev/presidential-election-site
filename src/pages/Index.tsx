import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface Candidate {
  id: string;
  name: string;
  party: string;
  photo: string;
  votes: number;
  description: string;
}

interface User {
  phone: string;
  hasVoted: boolean;
  votedFor?: string;
}

const ElectionPlatform = () => {
  // Начальные кандидаты
  const initialCandidates: Candidate[] = [
    {
      id: '1',
      name: 'Александр Петров',
      party: 'Партия Прогресса',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      votes: 0,
      description: 'Опытный политик с фокусом на экономическое развитие'
    },
    {
      id: '2',
      name: 'Мария Сидорова',
      party: 'Демократический Союз',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      votes: 0,
      description: 'Защитник социальных прав и образования'
    },
    {
      id: '3',
      name: 'Игорь Волков',
      party: 'Независимый кандидат',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      votes: 0,
      description: 'Молодой реформатор, сторонник цифровизации'
    }
  ];

  // Функции для работы с localStorage
  const loadFromStorage = () => {
    try {
      const savedCandidates = localStorage.getItem('election-candidates');
      const savedUsers = localStorage.getItem('election-users');
      const savedCurrentUser = localStorage.getItem('election-current-user');
      
      return {
        candidates: savedCandidates ? JSON.parse(savedCandidates) : initialCandidates,
        users: savedUsers ? JSON.parse(savedUsers) : [],
        currentUser: savedCurrentUser ? JSON.parse(savedCurrentUser) : null
      };
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      return {
        candidates: initialCandidates,
        users: [],
        currentUser: null
      };
    }
  };

  const saveToStorage = (candidates: Candidate[], users: User[], currentUser: User | null) => {
    try {
      localStorage.setItem('election-candidates', JSON.stringify(candidates));
      localStorage.setItem('election-users', JSON.stringify(users));
      localStorage.setItem('election-current-user', JSON.stringify(currentUser));
    } catch (error) {
      console.error('Ошибка сохранения данных:', error);
    }
  };

  // Состояние для кандидатов и пользователей
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [phone, setPhone] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [newCandidate, setNewCandidate] = useState<Partial<Candidate>>({});
  const [voteMessage, setVoteMessage] = useState('');

  // Загрузка данных при запуске
  useEffect(() => {
    const data = loadFromStorage();
    setCandidates(data.candidates);
    setUsers(data.users);
    setCurrentUser(data.currentUser);
  }, []);

  // Автосохранение при изменении данных
  useEffect(() => {
    if (candidates.length > 0) {
      saveToStorage(candidates, users, currentUser);
    }
  }, [candidates, users, currentUser]);

  // Получение общего количества голосов
  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);

  // Аутентификация пользователя
  const authenticateUser = () => {
    if (phone.length < 10) {
      alert('Введите корректный номер телефона');
      return;
    }

    let user = users.find(u => u.phone === phone);
    if (!user) {
      user = { phone, hasVoted: false };
      const updatedUsers = [...users, user];
      setUsers(updatedUsers);
    }
    
    setCurrentUser(user);
    setShowAuthDialog(false);
    setPhone('');
  };

  // Вход в админ панель
  const authenticateAdmin = () => {
    if (adminPassword === 'Putins') {
      setIsAdmin(true);
      setShowAdminDialog(false);
      setAdminPassword('');
    } else {
      alert('Неверный пароль');
    }
  };

  // Голосование
  const vote = (candidateId: string) => {
    if (!currentUser) {
      setShowAuthDialog(true);
      return;
    }

    if (currentUser.hasVoted) {
      alert('Вы уже проголосовали!');
      return;
    }

    // Обновляем голоса кандидата
    const updatedCandidates = candidates.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, votes: candidate.votes + 1 }
        : candidate
    );
    setCandidates(updatedCandidates);

    // Обновляем статус пользователя
    const updatedUser = { ...currentUser, hasVoted: true, votedFor: candidateId };
    const updatedUsers = users.map(u => u.phone === currentUser.phone ? updatedUser : u);
    
    setCurrentUser(updatedUser);
    setUsers(updatedUsers);

    const candidateName = candidates.find(c => c.id === candidateId)?.name;
    setVoteMessage(`Ваш голос за ${candidateName} засчитан!`);
    setTimeout(() => setVoteMessage(''), 3000);
  };

  // Добавление кандидата
  const addCandidate = () => {
    if (!newCandidate.name || !newCandidate.party) {
      alert('Заполните все поля');
      return;
    }

    const candidate: Candidate = {
      id: Date.now().toString(),
      name: newCandidate.name || '',
      party: newCandidate.party || '',
      photo: newCandidate.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      votes: 0,
      description: newCandidate.description || 'Описание кандидата'
    };

    const updatedCandidates = [...candidates, candidate];
    setCandidates(updatedCandidates);
    setNewCandidate({});
    setShowAddCandidate(false);
  };

  // Удаление кандидата
  const removeCandidate = (candidateId: string) => {
    const updatedCandidates = candidates.filter(c => c.id !== candidateId);
    setCandidates(updatedCandidates);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хедер */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Выборы Президента Петровского</h1>
              <p className="text-gray-600 mt-1">Цифровая избирательная платформа</p>
            </div>
            <div className="flex gap-3">
              {!currentUser ? (
                <Button 
                  onClick={() => setShowAuthDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Icon name="User" size={16} className="mr-2" />
                  Войти
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Badge variant="outline">
                    <Icon name="Phone" size={14} className="mr-1" />
                    {currentUser.phone}
                  </Badge>
                  {currentUser.hasVoted && (
                    <Badge className="bg-green-100 text-green-800">
                      <Icon name="CheckCircle" size={14} className="mr-1" />
                      Проголосовал
                    </Badge>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentUser(null)}
                  >
                    Выйти
                  </Button>
                </div>
              )}
              <Button 
                variant="outline"
                onClick={() => setShowAdminDialog(true)}
              >
                <Icon name="Settings" size={16} className="mr-2" />
                Админ
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Уведомление о голосовании */}
        {voteMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200 animate-fade-in">
            <Icon name="CheckCircle" size={16} />
            <AlertDescription className="text-green-800">{voteMessage}</AlertDescription>
          </Alert>
        )}

        {/* Статистика голосования */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon name="BarChart3" size={20} className="mr-2" />
              Результаты голосования
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalVotes}</div>
                <div className="text-gray-600">Всего голосов</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{users.filter(u => u.hasVoted).length}</div>
                <div className="text-gray-600">Проголосовало</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{users.length - users.filter(u => u.hasVoted).length}</div>
                <div className="text-gray-600">Не проголосовало</div>
              </div>
            </div>

            {totalVotes > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold">Распределение голосов:</h3>
                {candidates.map(candidate => (
                  <div key={candidate.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{candidate.name}</span>
                      <span>{candidate.votes} голосов ({totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0}%)</span>
                    </div>
                    <Progress 
                      value={totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Список кандидатов */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Кандидаты</h2>
            {isAdmin && (
              <Button onClick={() => setShowAddCandidate(true)}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить кандидата
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map(candidate => (
              <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <img 
                    src={candidate.photo} 
                    alt={candidate.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <CardTitle className="text-xl">{candidate.name}</CardTitle>
                  <Badge variant="secondary">{candidate.party}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{candidate.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{candidate.votes}</div>
                      <div className="text-sm text-gray-500">голосов</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0}%
                      </div>
                      <div className="text-sm text-gray-500">рейтинг</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 animate-vote-success"
                      onClick={() => vote(candidate.id)}
                      disabled={currentUser?.hasVoted}
                    >
                      <Icon name="Vote" size={16} className="mr-2" />
                      {currentUser?.hasVoted 
                        ? (currentUser.votedFor === candidate.id ? 'Ваш выбор' : 'Голосование завершено')
                        : 'Голосовать'
                      }
                    </Button>
                    
                    {isAdmin && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full"
                        onClick={() => removeCandidate(candidate.id)}
                      >
                        <Icon name="Trash2" size={14} className="mr-2" />
                        Удалить
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Диалог входа пользователя */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Вход в систему</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Номер телефона</label>
                <Input 
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button onClick={authenticateUser} className="w-full">
                Войти
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Диалог входа админа */}
        <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Вход в админ панель</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Пароль</label>
                <Input 
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
              <Button onClick={authenticateAdmin} className="w-full">
                Войти
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Диалог добавления кандидата */}
        <Dialog open={showAddCandidate} onOpenChange={setShowAddCandidate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить кандидата</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Имя</label>
                <Input 
                  value={newCandidate.name || ''}
                  onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Партия</label>
                <Input 
                  value={newCandidate.party || ''}
                  onChange={(e) => setNewCandidate({...newCandidate, party: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <Input 
                  value={newCandidate.description || ''}
                  onChange={(e) => setNewCandidate({...newCandidate, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Фото (URL)</label>
                <Input 
                  value={newCandidate.photo || ''}
                  onChange={(e) => setNewCandidate({...newCandidate, photo: e.target.value})}
                />
              </div>
              <Button onClick={addCandidate} className="w-full">
                Добавить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ElectionPlatform;