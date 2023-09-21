<?php

class BlockSendEmailPlugin extends \RainLoop\Plugins\AbstractPlugin
{
    public function Init()
    {
        $this->addHook('filter.smtp-credentials', 'FilterSmtpCredentials');
    }

    /**
     * @param \RainLoop\Model\Account $oAccount
     * @param array $aSmtpCredentials
     *
     * @throws \RainLoop\Exceptions\ClientException
     */
    public function FilterSmtpCredentials($oAccount, &$aSmtpCredentials)
    {
        if ($oAccount instanceof \RainLoop\Model\Account)
        {
            $sLogin = $oAccount->Login();
            if (empty($sLogin))
            {
                $sExceptions = \trim($this->Config()->Get('plugin', 'exceptions', ''));
                if (0 === \strlen($sExceptions) || !\RainLoop\Plugins\Helper::ValidateWildcardValues($sLogin, $sExceptions))
                {
                    throw new \RainLoop\Exceptions\ClientException(\RainLoop\Notifications::AuthError);
                }
            }
        }
    }

    /**
     * @return array
     */
    public function configMapping()
    {
        return array(
            \RainLoop\Plugins\Property::NewInstance('exceptions')->SetLabel('Exceptions')
                ->SetType(\RainLoop\Enumerations\PluginPropertyType::STRING_TEXT)
                ->SetDescription('Exceptions for send block, space as delimiter, wildcard supported.')
                ->SetDefaultValue('admin@* demo@domain.com')
        );
    }
}
