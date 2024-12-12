# 静态资源使用说明

## 字体使用
1. 在HTML文件中引入字体样式：
```html
<link rel="stylesheet" href="/public/css/fonts.css">
```

2. 使用字体：
```css
/* 中文内容使用思源黑体 */
.chinese-text {
    font-family: var(--font-primary);
}

/* 英文内容使用Roboto */
.english-text {
    font-family: var(--font-secondary);
}
```

## 图标使用
1. 在HTML文件中引入SVG图标：
```html
<object data="/public/icons/icons.svg" type="image/svg+xml" style="display: none;"></object>
```

2. 使用图标：
```html
<!-- 菜单图标 -->
<svg class="icon"><use xlink:href="#icon-menu"/></svg>

<!-- 关闭图标 -->
<svg class="icon"><use xlink:href="#icon-close"/></svg>

<!-- 搜索图标 -->
<svg class="icon"><use xlink:href="#icon-search"/></svg>

<!-- 用户图标 -->
<svg class="icon"><use xlink:href="#icon-user"/></svg>

<!-- 设置图标 -->
<svg class="icon"><use xlink:href="#icon-settings"/></svg>
```

3. 图标样式设置：
```css
.icon {
    width: 24px;
    height: 24px;
    fill: currentColor;
}
``` 