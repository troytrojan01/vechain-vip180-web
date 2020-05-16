#!/bin/sh
env="$1"
cd "$(dirname "$0")"
pwd
if [ "$env" != "closed" -a "$env" != "open" -a "$env" != "production" -a "$env" != "test" -a "$env" != "dev" ];then
    echo "命令用法： npm run deploy env，env 可以是 closed 或 open 或 production "
    exit
fi
if [ "$env" = "closed" ];then
    env_name="内测环境"
else 
    if [ "$env" = "open" ];then
        env_name="公测环境"
    else 
        if [ "$env" = "test" ];then
            env_name="外网测试"
        else 
            if [ "$env" = "dev" ];then
                env_name="外网开发"
            else
                env_name="正式环境"
            fi
        fi
    fi
fi
echo "开始在${env_name}中部署项目"
if [ "$env" != "closed" -a "$env" != "open" -a "$env" != "test" -a "$env" != "dev"  ];then
    read -r -p "确定在生产环境中部署吗? [y/N] " response
    if [[ "$response" =~ ^([nN][oO]|[nN])+$ ]]
    then
      exit 0
    fi
fi
ansible-playbook -i ./inventory.yaml ./deploy.yaml --extra-vars "env=${env}"
echo "Done!"
exit

