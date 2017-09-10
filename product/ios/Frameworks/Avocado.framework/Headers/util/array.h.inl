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

#include <new>

#define av_def_array_special(T, Container) \
template<>                        Array<T, Container<T>>::Array(uint length, uint capacity); \
template<> uint                   Array<T, Container<T>>::push(const Array& arr); \
template<> uint                   Array<T, Container<T>>::push(Array&& arr); \
template<> Array<T, Container<T>> Array<T, Container<T>>::slice(uint start, uint end); \
template<> uint Array<T, Container<T>>::write(const T* src, int to, uint size);\
template<> uint                   Array<T, Container<T>>::pop();  \
template<> uint                   Array<T, Container<T>>::pop(uint count);  \
template<> void                   Array<T, Container<T>>::clear()

av_ns(avocado)

// iterator

template<class T, class Container>
Array<T, Container>::iterator::iterator() : _host(NULL), _index(0) { }

template<class T, class Container>
Array<T, Container>::iterator::iterator(Array* host, uint index)
: _host(host), _index(index) { }

template<class T, class Container>
const T& Array<T, Container>::iterator::value() const {
  av_assert(_host);
  return (*_host)[_index];
}

template<class T, class Container>
T& Array<T, Container>::iterator::value() {
  av_assert(_host);
  return (*_host)[_index];
}

template<class T, class Container>
bool Array<T, Container>::iterator::equals(const iterator& it) const {
  return it._index == _index;
}

template<class T, class Container>
bool Array<T, Container>::iterator::is_null() const {
  return !_host || _index == _host->_length;
}

template<class T, class Container>
void Array<T, Container>::iterator::prev() { // --
  if (_host)
    _index = av_max(0, _index - 1);
}

template<class T, class Container>
void Array<T, Container>::iterator::next() { // ++
  if (_host)
    _index = av_min(_host->_length, _index + 1);
}

// Array

template<class T, class Container>
Array<T, Container>::Array(uint length, uint capacity)
: _length(length), _container(av_max(length, capacity))
{ 
  if (_length) {
    T* begin = *_container;
    T* end = begin + _length;
    
    while (begin < end) {
      new(begin) T(); // 调用默认构造
      begin++;
    }
  }
}

template<class T, class Container>
Array<T, Container>::Array(T* data, uint length, uint capacity)
: _length(length), _container(av_max(capacity, length), data)
{
}

template<class T, class Container>
Array<T, Container>::Array(const Array& arr) : _length(0), _container(0)
{
  push(arr);
}

template<class T, class Container>
Array<T, Container>::Array(Array&& arr) : _length(0), _container(0)
{
  T* t = *arr._container;
  _container.operator=(move(arr._container));
  if ( t == *_container ) {
    _length = arr._length;
    arr._length = 0;
  }
}

template<class T, class Container> Array<T, Container>::~Array() {
  clear();
}

template<class T, class Container>
Array<T, Container>& Array<T, Container>::operator=(const Array& arr) {
  clear(); push(arr);
  return *this;
}

template<class T, class Container>
Array<T, Container>& Array<T, Container>::operator=(Array&& arr) {
  if ( &arr._container == &_container ) return *this;
  clear();
  T* t = *arr._container;
  _container.operator=(move(arr._container));
  if ( t == *_container ) {
    _length = arr._length;
    arr._length = 0;
  }
  return *this;
}

template<class T, class Container>
const T& Array<T, Container>::operator[](uint index) const {
  // av_assert_err(index < _length, "Array access violation.");
  av_assert(index < _length);
  return (*_container)[index];
}

template<class T, class Container>
T& Array<T, Container>::operator[](uint index) {
  av_assert(index < _length);
  return (*_container)[index];
}

template<class T, class Container>
const T& Array<T, Container>::item(uint index) const {
  av_assert(index < _length);
  return (*_container)[index];
}

template<class T, class Container>
T& Array<T, Container>::item(uint index) {
  av_assert(index < _length);
  return (*_container)[index];
}

template<class T, class Container>
T& Array<T, Container>::set(uint index, const T& item) {
  av_assert(index <= _length);
  if ( index < _length ) {
    return ((*_container)[index] = item);
  }
  return (*_container)[push(item) - 1];
}

template<class T, class Container>
T& Array<T, Container>::set(uint index, T&& item) {
  av_assert(index <= _length);
  if ( index < _length ) {
    return ((*_container)[index] = move(item));
  }
  return (*_container)[push(move(item)) - 1];
}

template<class T, class Container>
uint Array<T, Container>::push(const T& item) {
  _length++;
  _container.realloc(_length);
  new((*_container) + _length - 1) T(item);
  return _length;
}

template<class T, class Container>
uint Array<T, Container>::push(T&& item) {
  _length++;
  _container.realloc(_length);
  new((*_container) + _length - 1) T(avocado::move(item));
  return _length;
}

template<class T, class Container>
uint Array<T, Container>::push(const Array& arr) {
  if (arr._length) {
    _length += arr._length;
    _container.realloc(_length);
    
    const T* source = *arr._container;
    T* end = (*_container) + _length;
    T* target = end - arr._length;
    
    while (target < end) {
      new(target) T(*source); // 调用复制构造
      source++; target++;
    }
  }
  return _length;
}

template<class T, class Container>
uint Array<T, Container>::push(Array&& arr) {
  if (arr._length) {
    _length += arr._length;
    _container.realloc(_length);
    
    const T* item = *arr._container;
    T* end = (*_container) + _length;
    T* begin = end - arr._length;
    
    while (begin < end) {
      new(begin) T(move(*item)); // 调用复制构造
      item++; begin++;
    }
  }
  return _length;
}

template<class T, class Container>
inline Array<T, Container> Array<T, Container>::slice(uint start) {
  return slice(start, _length);
}

template<class T, class Container>
Array<T, Container> Array<T, Container>::slice(uint start, uint end) {
  end = av_min(end, _length);
  if (start < end) {
    Array arr;
    arr._length = end - start;
    arr._container.realloc(arr._length);
    T* tar = *arr._container;
    T* e = tar + arr._length;
    const T* src = *_container + start;
    while (tar < e) {
      new(tar) T(*src);
      tar++; src++;
    }
    return arr;
  }
  return Array();
}

template<class T, class Container>
uint Array<T, Container>::write(const Array& arr, int to, int size, uint form) {
  int s = av_min(arr._length - form, size < 0 ? arr._length : size);
  if (s > 0) {
    return write((*arr._container) + form, to, s);
  }
  return 0;
}

/**
 * @func write
 */
template<class T, class Container>
uint Array<T, Container>::write(const T* src, int to, uint size) {
  if (size) {
    if ( to == -1 ) to = _length;
    uint old_len = _length;
    uint end = to + size;
    _length = av_max(end, _length);
    _container.realloc(_length);
    T* tar = (*_container) + to;
    
    for (int i = to; i < end; i++) {
      if (i < old_len) {
        reinterpret_cast<Wrap*>(tar)->~Wrap(); // 先释放原对像
      }
      new(tar) T(*src);
      tar++; src++;
    }
  }
  return size;
}

template<class T, class Container>
uint Array<T, Container>::pop() {
  if (_length) {
    _length--;
    reinterpret_cast<Wrap*>((*_container) + _length)->~Wrap(); // 释放
    _container.realloc(_length);
  }
  return _length;
}

template<class T, class Container>
uint Array<T, Container>::pop(uint count) {
  
  int j = av_max(_length - count, 0);
  if (_length > j) {
    do {
      _length--;
      reinterpret_cast<Wrap*>((*_container) + _length)->~Wrap(); // 释放
    } while (_length > j);
    
    _container.realloc(_length);
  }
  return _length;
}

template<class T, class Container> void Array<T, Container>::clear() {
  if (_length) {
    T* item = *_container;
    T* end = item + _length;
    while (item < end) {
      reinterpret_cast<Wrap*>(item)->~Wrap(); // 释放
      item++;
    }
    _length = 0;
  }
  _container.free();
}

template<class T, class Container>
typename Array<T, Container>::ConstIterator Array<T, Container>::begin() const {
  return ConstIterator(iterator(const_cast<Array*>(this), 0));
}

template<class T, class Container>
typename Array<T, Container>::ConstIterator Array<T, Container>::end() const {
  return ConstIterator(iterator(const_cast<Array*>(this), _length));
}

template<class T, class Container>
typename Array<T, Container>::Iterator Array<T, Container>::begin() {
  return Iterator(iterator(this, 0));
}

template<class T, class Container>
typename Array<T, Container>::Iterator Array<T, Container>::end() {
  return Iterator(iterator(this, _length));
}

template<class T, class Container>
inline uint Array<T, Container>::length() const {
  return _length;
}

template<class T, class Container>
inline uint Array<T, Container>::capacity() const {
  return _container.capacity();
}

av_def_array_special(char, Container);
av_def_array_special(byte, Container);
av_def_array_special(int16, Container);
av_def_array_special(uint16, Container);
av_def_array_special(int, Container);
av_def_array_special(uint, Container);
av_def_array_special(int64, Container);
av_def_array_special(uint64, Container);
av_def_array_special(float, Container);
av_def_array_special(double, Container);
av_def_array_special(bool, Container);

av_end
