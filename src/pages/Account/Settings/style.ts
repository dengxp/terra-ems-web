import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => {
    return {
        main: {
            display: 'flex',
            width: '100%',
            height: '100%',
            minHeight: '640px',
            backgroundColor: token.colorBgContainer,
            paddingTop: '16px',
            paddingBottom: '16px',
        },
        leftMenu: {
            width: '224px',
            borderRight: `1px solid ${token.colorSplit}`,
        },
        right: {
            flex: 1,
            padding: '8px 40px',
        },
        title: {
            marginBottom: '24px',
            color: token.colorTextHeading,
            fontWeight: '500',
            fontSize: '20px',
            lineHeight: '28px',
        },
    };
});

export default useStyles;
