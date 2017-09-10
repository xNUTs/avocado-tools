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

#ifndef __avocado__string__
#define __avocado__string__

#include <stdarg.h>
#include "array.h"
#include "util.h"
#include "handle.h"
#include "container.h"

av_ns(avocado)

/**
 * @class BasicString # 字符串模板
 * @bases Object
 * @template <class Char = char, class Container = Container<char>>
 */
template <class _Char, class _Container>
class AV_EXPORT BasicString: public Object {
public:
  typedef _Char Char;
  typedef _Container Container;
private:
  
  class StringCore {
  public:
    StringCore();
    StringCore(const StringCore&);
    StringCore(uint len);
    StringCore(uint len, Char* value);
    virtual void retain();
    virtual void release();
    virtual void modify(BasicString* host);
    inline Char* value() { return *container; }
    inline uint  capacity() { return container.capacity(); }
    inline Char* collapse();
    inline int ref() const { return m_ref; }
    uint length;
    Container container; protected:
    std::atomic_int m_ref;
  };
  
  friend class StringCore;
  static StringCore* use_empty();
  StringCore* m_core; // string core
  
  BasicString(StringCore* core);
public:
  BasicString();
  BasicString(char i);
  BasicString(int i);
  BasicString(uint i);
  BasicString(int64 i);
  BasicString(uint64 i);
  BasicString(float f);
  BasicString(double f);
  BasicString(const Char* s1, uint s1_len, const Char* s2, uint s2_len);
  BasicString(const Char* s, uint len);
  BasicString(const BasicString& s);
  BasicString(BasicString&& s);
  BasicString(ArrayBuffer<Char>&& data);
  BasicString(ArrayBuffer<Char>& data) = delete;
  BasicString(const Object& o);
  
  virtual
  ~BasicString() {
    m_core->release();
    m_core = nullptr;
  }
  
  /**
   * @func format
   */
  static String format(cchar* format, ...);
  
  /**
   * @func is_empty
   */
  inline bool is_empty() const {
    return m_core->length == 0;
  }
  
  /**
   * @func is_blank
   */
  bool is_blank() const;
  
  /**
   * @func c
   */
  inline const Char* c() const {
    return m_core->value();
  }
  
  /**
   * @func operator*
   */
  inline const Char* operator*() const {
    return m_core->value();
  }
  
  /**
   * @func operator[]
   */
  inline Char operator[](uint index) const {
    return m_core->value()[index];
  }
  
  /**
   * @func capacity
   */
  inline uint capacity() const {
    return m_core->capacity();
  }
  
  /**
   * @func length
   */
  inline uint length() const {
    return m_core->length;
  }
  
  /**
   * @func full_copy
   */
  BasicString full_copy() const;
  
  /**
   * @func split
   */
  Array<BasicString> split(const BasicString& sp) const;
  
  /**
   * @func trim
   */
  BasicString trim() const;
  
  /**
   * @func trim_left
   */
  BasicString trim_left() const;
  
  /**
   * @func trim_right
   */
  BasicString trim_right() const;
  
  /**
   * @func upper_case
   */
  BasicString& upper_case();
  
  /**
   * @func lower_case
   */
  BasicString& lower_case();
  
  /**
   * @func to_upper_case
   */
  BasicString to_upper_case() const;
  
  /**
   * @func to_upper_case
   */
  BasicString to_lower_case() const;
  
  /**
   * @func index_of
   */
  int index_of(const BasicString& s, uint start = 0) const;
  
  /**
   * @func last_index_of
   */
  int last_index_of(const BasicString& s, int start) const;
  
  /**
   * @func last_index_of
   */
  int last_index_of(const BasicString& s) const;
  
  /**
   * @func replace
   */
  BasicString replace(const BasicString& s, const BasicString& rep) const;
  
  /**
   * @func replace_all
   */
  BasicString replace_all(const BasicString& s, const BasicString& rep) const;
  
  /**
   * @func substr
   */
  inline BasicString substr(uint start, uint length) const {
    return BasicString(c() + start, length);
  }
  
  /**
   * @func substr
   */
  inline BasicString substr(uint start) const {
    return substr(start, length() - start);
  }
  
  /**
   * @func substring
   */
  inline BasicString substring(uint start, uint end) const {
    return BasicString(c() + start, end - start);
  }
  
  /**
   * @func substring
   */
  inline BasicString substring(uint start) const {
    return substring(start, length());
  }
  
  /**
   * @func push
   */
  BasicString& push(const Char* s, uint len);
  
  /**
   * @func push
   */
  BasicString& push(const BasicString& s);
  
  /**
   * @func push
   */
  BasicString& push(Char s);
  
  /**
   * @func operator+=
   */
  inline BasicString& operator+=(const BasicString& s) {
    return push(*s, s.length());
  }
  
  /**
   * @func operator+
   */
  inline BasicString operator+(const BasicString& s) const {
    return BasicString(c(), length(), *s, s.length());
  }
  
  /**
   * @func operator=
   */
  BasicString& operator=(const BasicString& s);
  
  /**
   * @func operator=
   */
  BasicString& operator=(BasicString&& s);

  /**
   * @func operator==
   */
  bool operator==(const BasicString& s) const;

  /**
   * @func operator!=
   */
  bool operator!=(const BasicString& s) const;

  /**
   * @func operator>
   */
  bool operator>(const BasicString& s) const;
  
  /**
   * @func operator<
   */
  bool operator<(const BasicString& s) const;
  
  /**
   * @func operator>=
   */
  bool operator>=(const BasicString& s) const;
  
  /**
   * @func operator<=
   */
  bool operator<=(const BasicString& s) const;
  
  /**
   * @constructor
   */
  BasicString(const Char* s);
  
  /**
   * @func index_of
   */
  int index_of(const Char* s, uint start = 0) const;
  
  /**
   * @func last_index_of
   */
  int last_index_of(const Char* s, int start) const;
  
  /**
   * @func last_index_of
   */
  int last_index_of(const Char* s) const;
  
  /**
   * @func replace
   */
  BasicString replace(const Char* s, const Char* rep) const;
  
  /**
   * @func replace_all
   */
  BasicString replace_all(const Char* s, const Char* rep) const;
  
  /**
   * @func push
   */
  BasicString& push(const Char* s);
  
  /**
   * @func operator+=
   */
  BasicString& operator+=(const Char* s);
  
  /**
   * @func operator+
   */
  BasicString operator+(const Char* s) const;
  
  
  /**
   * @func assignment
   */
  BasicString& assignment(const Char* s, uint len);
  
  /**
   * @func operator=
   */
  BasicString& operator=(const Char* s);
  
  /**
   * @func operator==
   */
  bool operator==(const Char* s) const;
  
  /**
   * @func operator!=
   */
  bool operator!=(const Char* s) const;
  
  /**
   * @func operator>
   */
  bool operator>(const Char* s) const;
  
  /**
   * @func operator<
   */
  bool operator<(const Char* s) const;
  
  /**
   * @func operator>=
   */
  bool operator>=(const Char* s) const;
  
  /**
   * @func operator<=
   */
  bool operator<=(const Char* s) const;
  
  /**
   * @overwrite
   */
  virtual bool equals(const Object& o) const;
  
  /**
   * @overwrite
   */
  virtual uint hash_code() const;
  
  /**
   * @overwrite
   */
  virtual String to_string() const;
  
  /**
  * @func collapse
  */
  Char* collapse();
  
  /**
   * @func collapse_buffer
   */
  ArrayBuffer<Char> collapse_buffer();
  
  /**
   * @func clone_buffer
   */
  ArrayBuffer<Char> copy_buffer() const;
  
  int to_int() const;
  uint to_uint() const;
  int64 to_int64() const;
  uint64 to_uint64() const;
  float to_float() const;
  double to_double() const;
  bool to_bool() const;
  bool to_int(int* out) const;
  bool to_uint(uint* out) const;
  bool to_int64(int64* out) const;
  bool to_uint64(uint64* out) const;
  bool to_float(float* out) const;
  bool to_double(double* out) const;
  bool to_bool(bool* out) const;
};

av_end

#include "string.h.inl"

#endif
