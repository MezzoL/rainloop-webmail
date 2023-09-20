<?php

class BlockSendEmailPlugin extends \RainLoop\Plugins\AbstractPlugin
{
    public function Init()
    {
        $this->addHook('filter.send-email', 'FilterSendEmail');
    }

    /**
     * @param string $sLogin
     *
     * @throws \RainLoop\Exceptions\ClientException
     */
    public function FilterSendEmail(&$sLogin)
    {
        if (empty($sLogin))
        {
            $sExceptions = \trim($this->Config()->Get('plugin', 'exceptions', ''));
            if (0 === \strlen($sExceptions) || !\RainLoop\Plugins\Helper::ValidateWildcardValues($sLogin, $sExceptions))
            {
                throw new \RainLoop\Exceptions\ClientException(
                    $this->Config()->Get('plugin', 'send_error', true) ?
                        \RainLoop\Notifications::SendError : \RainLoop\Notifications::AccountNotAllowed);
            }
        }
    }

    /**
     * @return array
     */
    public function configMapping()
    {
        return array(
            \RainLoop\Plugins\Property::NewInstance('send_error')->SetLabel('Send Error')
                ->SetType(\RainLoop\Enumerations\PluginPropertyType::BOOL)
                ->SetDescription('Throw a send error instead of an access error.')
                ->SetDefaultValue(true),
            \RainLoop\Plugins\Property::NewInstance('exceptions')->SetLabel('Exceptions')
                ->SetType(\RainLoop\Enumerations\PluginPropertyType::STRING_TEXT)
                ->SetDescription('Exceptions for send block, space as delimiter, wildcard supported.')
                ->SetDefaultValue('admin@* demo@domain.com')
        );
    }
}
