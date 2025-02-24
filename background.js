chrome.action.onClicked.addListener(async () => {
  try {
    // 获取所有打开的标签页
    const tabs = await chrome.tabs.query({ currentWindow: true });
    
    // 获取当前时间戳作为文件夹名
    const now = new Date();
    const folderName = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') + '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');
    
    // 查找或创建"存档书签"文件夹
    let archiveFolder = await chrome.bookmarks.search({ title: '存档书签' });
    if (archiveFolder.length === 0) {
      archiveFolder = await chrome.bookmarks.create({ title: '存档书签' });
    } else {
      archiveFolder = archiveFolder[0];
    }
    
    // 创建时间戳子文件夹
    const timeFolder = await chrome.bookmarks.create({
      parentId: archiveFolder.id,
      title: folderName
    });
    
    // 将所有标签页保存为书签
    for (const tab of tabs) {
      await chrome.bookmarks.create({
        parentId: timeFolder.id,
        title: tab.title,
        url: tab.url
      });
    }
    
    // 显示成功提示
    const notificationId = Math.random().toString(36).substring(7);
    const activeTabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (activeTabs[0]) {
      await chrome.scripting.insertCSS({
          target: { tabId: activeTabs[0].id },
          css: `
            .bookmark-notification {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #4CAF50;
              color: white;
              padding: 16px;
              border-radius: 4px;
              z-index: 999999;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              animation: slideIn 0.3s ease-out;
            }
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `
        });
        await chrome.scripting.executeScript({
          target: { tabId: activeTabs[0].id },
          func: (message, notificationId) => {
            const notification = document.createElement('div');
            notification.className = 'bookmark-notification';
            notification.id = notificationId;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => {
              notification.style.transition = 'opacity 0.3s ease-out';
              notification.style.opacity = '0';
              setTimeout(() => notification.remove(), 300);
            }, 4000);
          },
          args: [`已将 ${tabs.length} 个标签页保存到「所有书签/存档书签/${folderName}」文件夹中`, notificationId]
        });
    }
  } catch (error) {
    console.error('保存书签时出错:', error);
    // 显示错误提示
    const notificationId = Math.random().toString(36).substring(7);
    const activeTabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (activeTabs[0]) {
      await chrome.scripting.insertCSS({
          target: { tabId: activeTabs[0].id },
          css: `
            .bookmark-notification {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #f44336;
              color: white;
              padding: 16px;
              border-radius: 4px;
              z-index: 999999;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              animation: slideIn 0.3s ease-out;
            }
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `
        });
        await chrome.scripting.executeScript({
          target: { tabId: activeTabs[0].id },
          func: (message, notificationId) => {
            const notification = document.createElement('div');
            notification.className = 'bookmark-notification';
            notification.id = notificationId;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => {
              notification.style.transition = 'opacity 0.3s ease-out';
              notification.style.opacity = '0';
              setTimeout(() => notification.remove(), 300);
            }, 2000);
          },
          args: ['保存书签时出现错误，请稍后重试', notificationId]
        });
    }
  }
});