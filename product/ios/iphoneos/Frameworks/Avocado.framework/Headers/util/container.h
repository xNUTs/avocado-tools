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

#ifndef __avocado__container__
#define __avocado__container__

#include <math.h>
#include <string.h>
#include <stdlib.h>
#include "util.h"

/**
 * @ns avocado
 */

av_ns(avocado)

#ifndef av_min_capacity
#define av_min_capacity (8)
#endif

/**
 * @class Container
 */
template <class T> class AV_EXPORT Container {
public:
  
  ~Container() {
    free();
  }
  
  inline uint capacity() const { return m_capacity; }
  inline uint size() const { return sizeof(T) * m_capacity; }
  inline T* operator*() { return m_value; }
  inline const T* operator*() const { return m_value; }
  
  //
  
  Container(uint capacity = 0): m_capacity(0), m_value(nullptr) {
    if ( capacity ) {
      m_capacity = powf(2, ceil(log2(av_max(av_min_capacity, capacity))));
      m_value = static_cast<T*>(::malloc(size()));
      av_assert(m_value);
    }
  }
  
  Container(uint capacity, T* value)
  : m_capacity(capacity), m_value(value)
  { }
  
  Container(const Container& container): m_capacity(0), m_value(nullptr)  {
    operator=(container);
  }
  
  Container(Container&& container): m_capacity(0), m_value(nullptr) {
    operator=(avocado::move(container));
  }
  
  Container& operator=(const Container& container) {
    free();
    m_capacity = container.m_capacity;
    if (m_capacity) {
      m_value = static_cast<T*>(::malloc(size()));
      ::memcpy((void*)m_value, (void*)*container, size());
    }
    return *this;
  }
  
  Container& operator=(Container&& container) {
    free();
    m_capacity = container.m_capacity;
    m_value = container.collapse();
    return *this;
  }
  
  /**
   * @func realloc auro realloc
   * @arg capacity {uint}
   */
  void realloc(uint capacity) {
    if ( capacity ) {
      capacity = av_max(av_min_capacity, capacity);
      if ( capacity > m_capacity || capacity < m_capacity / 4.0 ) {
        realloc_(powf(2, ceil(log2(capacity))));
      }
    } else {
      free();
    }
  }
  
  /**
   * @func collapse
   */
  T* collapse() {
    T* rev = m_value;
    m_capacity = 0;
    m_value = nullptr;
    return rev;
  }
  
  /**
   * @func free
   */
  void free() {
    if ( m_value ) {
      ::free(m_value);
      m_capacity = 0;
      m_value = nullptr;
    }
  }

private:
  static void realloc__(Container* self, uint capacity, uint size_of);
  
protected:
  
  void realloc_(uint capacity) {
    Container<char>::realloc__( (Container<char>*)this, capacity, sizeof(T));
  }
  
  template<class S> friend class Container;
  
  uint  m_capacity;
  T*    m_value;
};

template <>
AV_EXPORT void Container<char>::realloc__(Container<char>* self, uint capacity, uint size_of);

av_end
#endif
