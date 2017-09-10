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

#ifndef __avocado__ajs__strs__
#define __avocado__ajs__strs__

#include "js.h"

#define ajs_common_string(F)  \
F(global)     F(exports)  F(constructor)  F(console)  F(_native)  F(__proto__)          \
F(prototype)  F(type)     F(value)        F(is_auto)  F(width)    F(height)             \
F(offset)     F(offset_x) F(offset_y)     F(_value)   F(r)        F(g)                  \
F(b)          F(a)        F(x)            F(y)        F(z)        F(start)              \
F(point)      F(end)      F(w)            F(size)     F(color)    F(toJSON)             \
F(___mark_json_stringify__)               F(stack)    F(get_path) F(_uncaught_exception)\
F(_exit)      F(__view_)  F(trigger_remove_view)                                        \
F(code)       F(message)  F(status)       F(url)      F(id)       F(start_x)            \
F(start_y)    F(force)    F(view)         F(m_noticer)            F(p1_x)     F(p1_y)   \
F(p2_x)       F(p2_y)     F(time)         F(m_change_touches)     F(name)     F(pathname)\
F(styles)     F(sender)   F(__controller_) F(Buffer)  F(data)     F(total)    F(complete)

ajs_begin

/**
 * @class CommonStrings
 */
class AV_EXPORT CommonStrings: public Object {
#define ajs_def_persistent_string(name) \
private: Persistent<JSValue> __##name##_$_; \
public: Local<JSValue> name() { \
  return *reinterpret_cast<Local<JSValue>*>(const_cast<Persistent<JSValue>*>(&__##name##_$_)); \
}
private:
  Worker* m_worker;
  ajs_def_persistent_string(Throw)
  ajs_common_string(ajs_def_persistent_string);
public:
  CommonStrings(Worker* worker);
};

ajs_end
#endif
