/**
 * 这个文件作为组件的目录
 * 目的是统一管理对外输出的组件，方便分类
 */
/**
 * 布局组件
 */
import Footer from './Footer';
import NoticeBanner from './NoticeBanner';
import Permission from './Permission';
import { NoticeIcon, Question, SelectLang } from './RightContent';
import { AvatarDropdown, AvatarName } from './RightContent/AvatarDropdown';

export * from './icons';
export { Footer, Question, SelectLang, NoticeIcon, AvatarDropdown, AvatarName, Permission, NoticeBanner };
