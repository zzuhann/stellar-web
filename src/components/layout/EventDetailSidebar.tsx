'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { CoffeeEvent } from '@/types';
import { firebaseTimestampToDate, formatDate, formatRelativeTime } from '@/utils';

interface EventDetailSidebarProps {
  event: CoffeeEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailSidebar({ event, isOpen, onClose }: EventDetailSidebarProps) {
  if (!event) return null;

  const remainingDays = Math.ceil(
    (firebaseTimestampToDate(event.datetime.end).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                      <button
                        type="button"
                        className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={onClose}
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">關閉面板</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>

                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                        活動詳情
                      </Dialog.Title>
                    </div>

                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {/* 活動圖片 */}
                      {event.mainImage && (
                        <div className="mb-6">
                          <img
                            src={event.mainImage}
                            alt={event.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* 活動標題 */}
                      <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
                        {remainingDays > 0 && (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            還有 {remainingDays} 天
                          </div>
                        )}
                      </div>

                      {/* 活動資訊 */}
                      <div className="space-y-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">應援藝人</p>
                            <p className="text-sm text-gray-600">
                              {event.artists.map((artist) => artist.name).join(', ')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">活動時間</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(firebaseTimestampToDate(event.datetime.start), {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              -
                              {formatDate(firebaseTimestampToDate(event.datetime.end), {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              ({formatRelativeTime(firebaseTimestampToDate(event.datetime.end))}
                              結束)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">活動地點</p>
                            <p className="text-sm text-gray-600">{event.location.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* 活動描述 */}
                      {event.description && (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">活動說明</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {event.description}
                          </p>
                        </div>
                      )}

                      {/* 聯絡資訊 */}
                      {event.socialMedia && (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-900 mb-3">社群媒體</h3>
                          <div className="space-y-2">
                            {event.socialMedia.instagram && (
                              <div className="flex items-center space-x-2">
                                <PhoneIcon className="h-4 w-4 text-gray-400" />
                                <a
                                  href={`https://instagram.com/${event.socialMedia.instagram.replace('@', '')}`}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  {event.socialMedia.instagram}
                                </a>
                              </div>
                            )}
                            {event.socialMedia.x && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">X:</span>
                                <a
                                  href={`https://x.com/${event.socialMedia.x.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  {event.socialMedia.x}
                                </a>
                              </div>
                            )}
                            {event.socialMedia.threads && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Threads:</span>
                                <a
                                  href={`https://threads.net/${event.socialMedia.threads.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  Threads
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 操作按鈕 */}
                      <div className="space-y-3">
                        <button
                          type="button"
                          className="w-full bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
                          onClick={() => {
                            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.address)}`;
                            window.open(googleMapsUrl, '_blank');
                          }}
                        >
                          前往 Google 地圖
                        </button>

                        <button
                          type="button"
                          className="w-full bg-white text-amber-600 border border-amber-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
                          onClick={() => {
                            const text = `${event.title} - ${event.artists.map((artist) => artist.name).join(', ')} 應援咖啡活動\n${event.location.address}\n${window.location.href}`;
                            navigator.share?.({ title: event.title, text }) ||
                              navigator.clipboard?.writeText(text);
                          }}
                        >
                          分享活動
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
