/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2015, xuewen.chu
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of xuewen.chu nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL xuewen.chu BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

#ifndef __avocado__thread__
#define __avocado__thread__

#include "util.h"
#include "list.h"
#include "map.h"
#include "event.h"
#include <functional>
#include <thread>
#include <mutex>
#include <atomic>
#include <condition_variable>
#include "cb.h"

/**
 * @ns avocado
 */

av_ns(avocado)
av_ns(gui)

class GUIApplication;

av_end

typedef std::atomic_bool  AtomicBool;
typedef std::atomic_int   AtomicInt;
typedef std::thread::id   ThreadID;
typedef std::mutex Mutex;
typedef std::recursive_mutex RecursiveMutex;
typedef std::lock_guard<Mutex> ScopeLock;
typedef std::unique_lock<Mutex> Lock;
typedef std::condition_variable Condition;

template<>
uint Compare<ThreadID>::hash(const ThreadID &key);
template<>
bool Compare<ThreadID>::equals(const ThreadID& a,
                               const ThreadID& b, uint ha, uint hb);

class RunLoop;
class KeepLoop;

/**
 * @class SimpleThread
 */
class AV_EXPORT SimpleThread {
public:
  typedef NonObjectTraits Traits;
  
#define av_thread_lock(thread) \
  ScopeLock thread##_lock(thread.mutex()); if (!t.is_abort())

  typedef std::function<void(SimpleThread& thread)> ThreadExec;
  
  /**
   * @func fork()
   */
  static ThreadID fork(ThreadExec exec, cString& name);
  
  /**
   * @func is_abort
   */
  inline bool is_abort() const { return m_abort; }
  
  /**
   * @func mutex
   */
  inline Mutex& mutex() { return m_mutex; }
  
  /**
   * @func id
   */
  inline ThreadID id() const { return m_id; }
  
  /**
   * @func name
   */
  inline String name() const { return m_name; }
  
  /**
   * @func sleep current thread
   */
  static void sleep_for(uint64 timeUs = 0);
  
  /**
   * @func current_id get current thread id
   */
  static ThreadID current_id();
  
  /**
   * @func main_thread_id
   */
  static ThreadID main_thread_id();
  
  /**
   * @func current
   */
  static SimpleThread* current();
  
  /**
   * @func get_specific_data
   */
  static void* get_specific_data(char id);
  
  /**
   * @func set_specific_data
   */
  static void set_specific_data(char id, void* data);
  
  /**
   * @func has_io_thread
   */
  static bool has_io_thread();
  
  /**
   * @func abort
   */
  static void abort(ThreadID id, bool wait_end = false);
  
  /**
   * @func wait_end
   */
  static void wait_end(ThreadID id);
  
  /**
   * @func awaken
   */
  static void awaken(ThreadID id);

private:
  
  struct WaitEnd {
    Mutex mutex;
    Condition cond;
  };
  
  typedef Array<WaitEnd*> WaitEnds;
  
  Mutex     m_mutex;
  Condition m_cond;
  WaitEnds  m_wait_end;
  bool      m_abort;
  ThreadID  m_id;
  uint      m_gid;
  String    m_name;
  RunLoop*  m_loop;
  
  av_def_inl_cls(Inl);
};

/**
 * @class ParallelWorking
 */
class AV_EXPORT ParallelWorking: public Object {
  av_hidden_all_copy(ParallelWorking);
public:
  typedef SimpleThread::ThreadExec ThreadExec;
  
  ParallelWorking() av_def_err;
  
  /**
   * @destructor
   */
  virtual ~ParallelWorking();
  
  /**
   * @func fork
   */
  ThreadID fork(ThreadExec exec, cString& name);
  
  /**
   * @func abort_fork
   */
  void abort_fork(ThreadID id = ThreadID());
  
  /**
   * @func awaken
   */
  void awaken(ThreadID id = ThreadID());
  
  /**
   * @func post message to main thread
   */
  uint post(Callback cb);
  
  /**
   * @func post
   */
  uint post(Callback cb, uint64 delay_us);
  
  /**
   * @func abort_post
   */
  void abort_post(uint id = 0);
  
  /**
   * @func mutex
   */
  inline Mutex& mutex() { return m_mutex; }
  
private:
  
  KeepLoop*  m_proxy;
  Map<ThreadID, ThreadID> m_threads;
  Mutex m_mutex;
  uint  m_gid;
};

/**
 * @class PostMessage
 */
class AV_EXPORT PostMessage {
public:
  virtual uint post_message(Callback cb, uint64 delay_us = 0) = 0;
};

/**
 * @class RunLoop
 */
class AV_EXPORT RunLoop: public Object, public PostMessage {
  av_hidden_all_copy(RunLoop);
public:
  
  RunLoop();
  
  /**
   * @destructor
   */
  virtual ~RunLoop();
  
  /**
   * @event onstart
   */
  av_event(onstart);
  
  /**
   * @event onloop
   */
  av_event(onloop);
  
  /**
   * @event onend
   */
  av_event(onend);
  
  /**
   * @get timeout {int64}
   */
  inline int64 timeout() const { return _timeout_us; }
  
  /**
   * @func runing
   */
  bool runing() const;
  
  /**
   * @func is_alive
   */
  bool is_alive();

  /**
   * @func post
   */
  uint post(Callback cb);
  
  /**
   * @func post message
   */
  uint post(Callback cb, uint64 delay_us);
  
  /**
   * @overwrite
   */
  virtual uint post_message(Callback cb, uint64 delay_us = 0);
  
  /**
   * @func abort # 中止消息
   */
  void abort(uint id);
  
  /**
   * 超时设置
   * 没有新消息时的等待时间,
   * 小于0没有新消息立即结束,0永远等待,大于0为超时时间(微妙us)
   * @func run_loop # 运行消息循环
   * @arg timeout_us {int64}
   */
  bool run_loop(int64 timeout_us = 0);
  
  /**
   * @func stop_signal 发出停止信号,并不会立即停止,但不会接收任何新消息
   */
  void stop_signal();
  
  /**
   * 保持活动状态,并返回一个代理,只要不删除返回的代理对像,消息队列会一直保持活跃状态
   * 当前必须为活跃状态否则返回NULL
   * @func keep_alive(declear)
   */
  KeepLoop* keep_alive(bool declear = true);
  
  /**
   * @func current # 获取当前线程消息队列,如果没有返回NULL
   */
  static RunLoop* current();
  
  /**
   * @func keep_alive_current(declear) 保持当前循环活跃并返回代理
   */
  static KeepLoop* keep_alive_current(bool declear = true);
  
  /**
   * @func loop # 通过线程获取
   * @ret {RunLoop*}
   */
  static RunLoop* loop(ThreadID id);
  
  /**
   * @func utils
   */
  static RunLoop* utils();
  
  /**
   * @func next_tick
   */
  static void next_tick(Callback cb);
  
  /**
   * @func post_io
   */
  static void post_io(Callback cb, bool fast = false);
  
private:
  
  friend class KeepLoop;
  
  av_def_inl_cls(Inl);
  
  struct ExecWrap {
    uint id;
    uint group;
    std::chrono::steady_clock::duration du;
    Callback exec;
  };
  
  SimpleThread* _thread;
  List<ExecWrap>  _exec;
  bool  _stop_signal;
  Condition _cond;
  Mutex _action_lock;
  Mutex _run_lock;
  /* 超时设置
   * 没有新消息时的等待时间,
   * 小于0立即结束,0永远等待,大于0为超时时间(微妙us) */
  int64 _timeout_us;
  uint  _ref_count;
};

/**
 * @class KeepLoop 这个对像能保持RunLoop的循环不自动终止
 */
class AV_EXPORT KeepLoop: public Object, public PostMessage {
  av_hidden_all_copy(KeepLoop);
public:
  av_default_allocator();
  /**
   * @destructor `destructor_clear=true`时会取消通过它`post`的所有消息
   */
  virtual ~KeepLoop();
  uint post(Callback cb);
  uint post(Callback cb, uint64 delay_us);
  virtual uint post_message(Callback cb, uint64 delay_us = 0);
  /**
   * @func clear() 取消之前`post`的所有消息
   */
  void clear();
  inline void abort(uint id) { m_loop->abort(id); }
  inline RunLoop* host() { return m_loop; }
private:
  /**
 * @constructor `declear=true`时表示析构时会进行清理
 */
  inline KeepLoop(bool destructor_clear): m_group(iid32()), m_declear(destructor_clear) {
  }
  RunLoop* m_loop;
  uint  m_group;
  bool  m_declear;
  friend class RunLoop;
};

av_end
#endif
