'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const url = mode === 'login' 
        ? '/api/game/auth/login' 
        : '/api/game/auth/register'
      
      const body = mode === 'login'
        ? { username, password }
        : { username, password, nickname }
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || '操作失败')
        return
      }
      
      // 存储用户 ID 到 localStorage 作为备用
      if (data.user?.id) {
        localStorage.setItem('game_user_id', data.user.id)
      }
      
      // 登录/注册成功，跳转到游戏页面
      window.location.href = '/'
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎮</div>
          <h1 style={{
            color: '#e0e0e0',
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}>
            英语冒险世界
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            边玩边学，轻松掌握英语
          </p>
        </div>
        
        {/* 模式切换 */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '24px',
        }}>
          <button
            type="button"
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '10px',
              background: mode === 'login' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
              color: mode === 'login' ? 'white' : '#888',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '10px',
              background: mode === 'register' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
              color: mode === 'register' ? 'white' : '#888',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            注册
          </button>
        </div>
        
        {/* 表单 */}
        <form onSubmit={handleSubmit}>
          {/* 用户名 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#888',
              fontSize: '13px',
              marginBottom: '8px',
            }}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#e0e0e0',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          
          {/* 昵称（仅注册时显示） */}
          {mode === 'register' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: '#888',
                fontSize: '13px',
                marginBottom: '8px',
              }}>
                昵称（可选）
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="显示在游戏中的名称"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#e0e0e0',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          )}
          
          {/* 密码 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#888',
              fontSize: '13px',
              marginBottom: '8px',
            }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#e0e0e0',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          
          {/* 错误提示 */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '12px',
              color: '#ef4444',
              fontSize: '14px',
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}
          
          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading 
                ? '#444' 
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </button>
        </form>
        
        {/* 提示 */}
        <p style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '12px',
          marginTop: '24px',
        }}>
          {mode === 'login' ? (
            <>
              还没有账号？
              <button
                type="button"
                onClick={() => setMode('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  cursor: 'pointer',
                  marginLeft: '4px',
                }}
              >
                立即注册
              </button>
            </>
          ) : (
            <>
              已有账号？
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  cursor: 'pointer',
                  marginLeft: '4px',
                }}
              >
                立即登录
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
