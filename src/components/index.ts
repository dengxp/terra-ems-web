/**
 * 这个文件作为组件的目录
 * 目的是统一管理对外输出的组件，方便分类
 */
/**
 * 布局组件
 */
import Footer from './Footer';
import { Question, SelectLang, NoticeIcon } from './RightContent';
import { AvatarDropdown, AvatarName } from './RightContent/AvatarDropdown';
import Permission from './Permission';
import NoticeBanner from './NoticeBanner';

export * from './icons';
export { Footer, Question, SelectLang, NoticeIcon, AvatarDropdown, AvatarName, Permission, NoticeBanner };
